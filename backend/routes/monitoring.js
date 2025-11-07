// routes/monitoring.js
import express from "express";
import mongoose from "mongoose";
import Monitoring from "../models/modelsMonitoring.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import fetch from "node-fetch";

const router = express.Router();

// ======================================================
// 🧠 Utility: MongoDB connection + latency check
// ======================================================
async function checkMongoLatency(mongoUrl) {
  const start = Date.now();
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(mongoUrl || process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await mongoose.connection.db.admin().ping();
    return { status: "Connected", latency: Date.now() - start };
  } catch (err) {
    console.error("⚠️ MongoDB Ping Error:", err?.message || err);
    return { status: "Disconnected", latency: 0 };
  }
}

// ======================================================
// ⚙️ Utility: Get next available Prisma port
// ======================================================
async function getNextPrismaPort() {
  const used = await Monitoring.find({}, "prismaPort");
  const usedPorts = used.map((u) => u.prismaPort).filter(Boolean);
  let port = 5555;
  while (usedPorts.includes(port)) port++;
  return port;
}

// ======================================================
// 🗂️ FILE UPLOAD (Schema / Config Upload)
// ======================================================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/upload-schema", upload.single("file"), (req, res) => {
  try {
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
  } catch (err) {
    console.error("❌ Upload Error:", err.message);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// ======================================================
// 📋 GET ALL DATABASES
// ======================================================
router.get("/all", async (req, res) => {
  try {
    const userId = req.query.userId; // optional
    const filter = userId ? { userId } : {}; // fetch all if userId not provided
    const data = await Monitoring.find(filter);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ /all error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// ➕ ADD NEW DATABASE (with Prisma Support)
// ======================================================
router.post("/add", async (req, res) => {
  try {
    const { name, mongoUrl, schemaPath, prismaPort, userId: bodyUserId } = req.body;

    const userId = bodyUserId; // frontend must send userId
    if (!userId)
      return res.status(400).json({ success: false, error: "userId is required" });

    if (!name?.trim())
      return res.status(400).json({ success: false, error: "Name required" });

    const assignedPort = prismaPort && Number(prismaPort) ? Number(prismaPort) : await getNextPrismaPort();
    const { status, latency } = await checkMongoLatency(mongoUrl);

    const newDB = await Monitoring.create({
      name,
      mongoUrl,
      schemaPath,
      prismaPort: assignedPort,
      userId,
      status1: status,
      status2: status,
      latency,
      lastUpdate: new Date().toLocaleTimeString(),
      analytics: [{ time: new Date().toLocaleTimeString(), response: latency }],
    });

    // Launch Prisma Studio if schema is provided
    if (schemaPath) {
      const schemaAbsolute = path.join(process.cwd(), schemaPath);
      exec(`npx prisma studio --port ${assignedPort}`, (error) => {
        if (error) {
          console.error(`❌ Prisma Studio failed on port ${assignedPort}:`, error.message);
        } else {
          console.log(`🚀 Prisma Studio running on http://localhost:${assignedPort}`);
        }
      });
    }

    res.json({ success: true, db: newDB });
  } catch (err) {
    console.error("❌ Add DB error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// ✏️ UPDATE DATABASE INFO
// ======================================================
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid ID" });

    const updated = await Monitoring.findByIdAndUpdate(id, updates, { new: true });
    if (!updated)
      return res.status(404).json({ success: false, error: "Database not found" });

    res.json({ success: true, db: updated });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// 🗑️ DELETE DATABASE
// ======================================================
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid ID" });

    await Monitoring.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// 🧭 OPEN PRISMA STUDIO MANUALLY
// ======================================================
router.get("/open/:id", async (req, res) => {
  try {
    const db = await Monitoring.findById(req.params.id);

    if (!db || !db.prismaPort)
      return res.status(404).json({ success: false, message: "Database not found or Prisma not configured." });

    exec(`npx prisma studio --port ${db.prismaPort}`, (error) => {
      if (error) {
        console.error(`❌ Prisma Studio failed on port ${db.prismaPort}:`, error.message);
      } else {
        console.log(`🚀 Prisma Studio running on http://localhost:${db.prismaPort}`);
      }
    });

    res.json({
      success: true,
      url: `http://localhost:${db.prismaPort}`,
      message: "Prisma Studio launched successfully.",
    });
  } catch (err) {
    console.error("❌ Prisma launch error:", err.message);
    res.status(500).json({ success: false, error: "Failed to open Prisma Studio" });
  }
});

// ======================================================
// 📊 LIVE METRICS UPDATE
// ======================================================
router.get("/metrics", async (req, res) => {
  try {
    const { status, latency } = await checkMongoLatency();
    const time = new Date().toLocaleTimeString();

    await Monitoring.updateMany(
      {},
      {
        $push: { analytics: { time, response: latency } },
        $set: { status1: status, status2: status, latency, lastUpdate: time },
      }
    );

    res.json({ success: true, data: { time, latency, status } });
  } catch (err) {
    console.error("❌ Metrics error:", err.message);
    res.status(500).json({ success: false, error: "Metrics update failed" });
  }
});

// ======================================================
// 🧠 AI: Database-aware assistant using Ollama (llama3.2:1b)
// ======================================================
router.post("/ask", async (req, res) => {
  try {
    const { id, message } = req.body;
    if (!message?.trim())
      return res.status(400).json({ success: false, error: "Message is required" });

    let prompt = `You are a helpful assistant specialized in database schemas, Prisma, and MongoDB monitoring.\n`;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, error: "Invalid DB id" });

      const db = await Monitoring.findById(id);
      if (!db) return res.status(404).json({ success: false, error: "Database not found" });

      prompt += `\nDatabase metadata:\n`;
      prompt += db._id ? `- id: ${db._id}\n` : "";
      prompt += db.name ? `- name: ${db.name}\n` : "";
      prompt += db.mongoUrl ? `- mongoUrl: ${db.mongoUrl}\n` : "";
      prompt += db.prismaPort ? `- prismaPort: ${db.prismaPort}\n` : "";
      prompt += db.status1 ? `- status1: ${db.status1}\n` : "";
      prompt += db.status2 ? `- status2: ${db.status2}\n` : "";
      prompt += db.latency !== undefined ? `- latency(ms): ${db.latency}\n` : "";
      prompt += db.lastUpdate ? `- lastUpdate: ${db.lastUpdate}\n` : "";

      if (Array.isArray(db.analytics) && db.analytics.length > 0) {
        const sample = db.analytics
          .slice(-10)
          .map((a) => `${a.time}:${a.response}`)
          .join(", ");
        prompt += `- recentAnalytics(last up to 10): ${sample}\n`;
      }

      if (db.schemaPath) {
        try {
          const abs = path.join(process.cwd(), db.schemaPath);
          if (fs.existsSync(abs)) {
            const raw = fs.readFileSync(abs, "utf8");
            const excerpt =
              raw.length > 20000 ? raw.slice(0, 20000) + "\n\n[TRUNCATED]" : raw;
            prompt += `\nPrisma schema excerpt (truncated to 20KB):\n${excerpt}\n`;
          } else {
            prompt += `\nPrisma schema file not found at path: ${db.schemaPath}\n`;
          }
        } catch (err) {
          console.error("❌ Error reading schema file:", err.message);
          prompt += `\nCould not read schema file (error).\n`;
        }
      }
    }

    prompt += `\nUser question:\n${message}\n\nAnswer concisely, and if giving commands provide exact command examples (e.g., prisma migrate, npx prisma studio --port <port>, mongo shell commands).`;

    const ollamaUrl = "http://localhost:11434/api/generate";
    const payload = { model: "llama3.2:1b", prompt, stream: false };

    const resp = await fetch(ollamaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let obj = {};
    try {
      obj = JSON.parse(text);
    } catch {
      return res.json({ success: true, reply: text });
    }

    const reply =
      obj.response || obj.output || obj.text || (obj[0] && obj[0].content) || JSON.stringify(obj);

    res.json({ success: true, reply });
  } catch (err) {
    console.error("❌ AI ask error:", err.message);
    res.status(500).json({ success: false, error: "AI assistant error" });
  }
});

export default router;
