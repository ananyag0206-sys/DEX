import express from "express";
import mongoose from "mongoose";
import Monitoring from "../models/modelsMonitoring.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import fetch from "node-fetch";
// import { createCollection, insertVector, searchVector } from "../config/qdrant.js"; // updated import

const router = express.Router();

/* ======================================================
   🧠 Utility: MongoDB latency check
====================================================== */
async function checkMongoLatency(mongoUrl) {
  const start = Date.now();
  const uri = (mongoUrl && String(mongoUrl).trim()) || process.env.MONGO_URI;
  if (!uri) return { status: "Disconnected", latency: 0 };
  let conn;
  try {
    conn = mongoose.createConnection(uri);
    await conn.asPromise();
    await conn.db.admin().ping();
    const latency = Date.now() - start;
    await conn.close();
    return { status: "Connected", latency };
  } catch {
    if (conn) {
      try {
        await conn.close();
      } catch (_) {
        /* ignore */
      }
    }
    return { status: "Disconnected", latency: 0 };
  }
}

/* ======================================================
   🧠 Utility: Qdrant latency + health check
====================================================== */
async function checkQdrantLatency(qdrantUrl) {
  const start = Date.now();
  try {
    if (!qdrantUrl) throw new Error("Qdrant URL missing");
    const res = await fetch(`${qdrantUrl}/collections`);
    if (!res.ok) throw new Error("Qdrant not reachable");
    return { status: "Connected", latency: Date.now() - start };
  } catch (err) {
    console.error("⚠️ Qdrant Ping Error:", err.message);
    return { status: "Disconnected", latency: 0 };
  }
}

/* ======================================================
   ⚙️ Utility: Get next available Prisma port
====================================================== */
async function getNextPrismaPort() {
  const used = await Monitoring.find({}, "prismaPort");
  const usedPorts = used.map((u) => u.prismaPort).filter(Boolean);
  let port = 5555;
  while (usedPorts.includes(port)) port++;
  return port;
}

/* ======================================================
   🗂️ File Upload
====================================================== */
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.post("/upload-schema", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({
    success: true,
    message: "File uploaded successfully",
    file: {
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toLocaleString(),
    },
  });
});

/* ======================================================
   📋 GET ALL DATABASES
====================================================== */
router.get("/all", async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const data = await Monitoring.find(filter);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ======================================================
   ➕ ADD NEW DATABASE (Mongo | SQL | Qdrant)
====================================================== */
router.post("/add", async (req, res) => {
  try {
    const { name, dbType, mongoUrl, qdrantUrl, schemaPath, prismaPort, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });
    if (!dbType) return res.status(400).json({ error: "dbType required" });

    let status = "Unknown";
    let latency = 0;
    let assignedPort = null;

    // MongoDB
    if (dbType === "mongo") {
      const r = await checkMongoLatency(mongoUrl);
      status = r.status;
      latency = r.latency;
    }

    // SQL / Prisma
    if (dbType === "sql") {
      assignedPort = prismaPort && Number(prismaPort) ? Number(prismaPort) : await getNextPrismaPort();
      if (mongoUrl) {
        const r = await checkMongoLatency(mongoUrl);
        status = r.status;
        latency = r.latency;
      }

      if (schemaPath) {
        const schemaDir = path.dirname(schemaPath);
        const schemaFile = path.basename(schemaPath);
        exec(`cd "${path.join(process.cwd(), schemaDir)}" && npx prisma studio --port ${assignedPort} --schema="${schemaFile}" --hostname=0.0.0.0`, (err, stdout, stderr) => {
          if (err) console.error("❌ Prisma Exec Error:", err.message);
          if (stdout) console.log("Prisma Stdout:", stdout);
          if (stderr) console.error("Prisma Stderr:", stderr);
        });
      }
    }

    if (dbType === "qdrant") {
      const r = await checkQdrantLatency(qdrantUrl);
      status = r.status;
      latency = r.latency;
    }

    const newDB = await Monitoring.create({
      name,
      dbType,
      mongoUrl: dbType === "mongo" || dbType === "sql" ? mongoUrl : null,
      qdrantUrl: dbType === "qdrant" ? qdrantUrl : null,
      schemaPath: dbType === "sql" ? schemaPath : null,
      prismaPort: dbType === "sql" ? assignedPort : null,
      userId,
      status1: status,
      status2: status,
      latency,
      lastUpdate: new Date(),
      analytics: [{ time: new Date(), response: latency }],
    });

    res.json({ success: true, db: newDB });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ======================================================
   ✏️ UPDATE DATABASE INFO
====================================================== */
router.put("/update/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ error: "Invalid ID" });

  const updated = await Monitoring.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, db: updated });
});

/* ======================================================
   🗑️ DELETE DATABASE
====================================================== */
router.delete("/delete/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ error: "Invalid ID" });

  await Monitoring.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ======================================================
   🧭 OPEN PRISMA STUDIO MANUALLY
====================================================== */
router.get("/open/:id", async (req, res) => {
  try {
    const db = await Monitoring.findById(req.params.id);
    if (!db || !db.prismaPort)
      return res.status(404).json({ error: "Prisma not configured" });

    if (db.schemaPath) {
      const schemaDir = path.dirname(db.schemaPath);
      const schemaFile = path.basename(db.schemaPath);
      exec(`cd "${path.join(process.cwd(), schemaDir)}" && npx prisma studio --port ${db.prismaPort} --schema="${schemaFile}" --hostname=0.0.0.0`, (err, stdout, stderr) => {
        if (err) console.error("❌ Prisma Exec Error:", err.message);
        if (stdout) console.log("Prisma Stdout:", stdout);
        if (stderr) console.error("Prisma Stderr:", stderr);
      });
    } else {
      exec(`npx prisma studio --port ${db.prismaPort} --hostname=0.0.0.0`, (err, stdout, stderr) => {
        if (err) console.error("❌ Prisma Exec Error:", err.message);
        if (stdout) console.log("Prisma Stdout:", stdout);
        if (stderr) console.error("Prisma Stderr:", stderr);
      });
    }

    res.json({ success: true, url: `http://localhost:${db.prismaPort}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ======================================================
   📊 LIVE METRICS UPDATE (AUTO BY DB TYPE)
====================================================== */
router.get("/metrics", async (req, res) => {
  const all = await Monitoring.find();

  for (const db of all) {
    let r = { status: "Unknown", latency: 0 };

    if (db.dbType === "mongo") {
      r = await checkMongoLatency(db.mongoUrl);
    }

    if (db.dbType === "sql" && db.mongoUrl) {
      r = await checkMongoLatency(db.mongoUrl);
    }

    if (db.dbType === "qdrant") {
      r = await checkQdrantLatency(db.qdrantUrl);
    }

    await Monitoring.findByIdAndUpdate(db._id, {
      $push: { analytics: { time: new Date(), response: r.latency } },
      $set: { status1: r.status, status2: r.status, latency: r.latency, lastUpdate: new Date() },
    });
  }

  res.json({ success: true });
});

/* ======================================================
   🔹 Qdrant Routes: Insert / Search with validation
====================================================== */
// router.post("/qdrant/insert", async (req, res) => {
//   const { dbName, vector, payload } = req.body;
//   if (!dbName || !vector) return res.status(400).json({ error: "dbName and vector required" });

//   if (!Array.isArray(vector) || !vector.every((v) => typeof v === "number"))
//     return res.status(400).json({ error: "Vector must be an array of numbers" });

//   try {
//     const db = await Monitoring.findOne({ name: dbName, dbType: "qdrant" });
//     if (!db || !db.qdrantUrl) return res.status(404).json({ error: "Qdrant DB not found" });

//     await createCollection(`${dbName}_default`, db.qdrantUrl);
//     await insertVector(`${dbName}_default`, vector, payload || {}, db.qdrantUrl);

//     res.json({ success: true, message: "Vector inserted into Qdrant" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// router.post("/qdrant/search", async (req, res) => {
//   const { dbName, vector, limit } = req.body;
//   if (!dbName || !vector) return res.status(400).json({ error: "dbName and vector required" });

//   if (!Array.isArray(vector) || !vector.every((v) => typeof v === "number"))
//     return res.status(400).json({ error: "Vector must be an array of numbers" });

//   try {
//     const db = await Monitoring.findOne({ name: dbName, dbType: "qdrant" });
//     if (!db || !db.qdrantUrl) return res.status(404).json({ error: "Qdrant DB not found" });

//     const results = await searchVector(`${dbName}_default`, vector, limit || 5, db.qdrantUrl);
//     res.json({ success: true, results });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

router.post("/ask", async (req, res) => {
  res.json({ success: true, reply: "AI route unchanged" });
});

export default router;