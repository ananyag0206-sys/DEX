import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import connectDB from "./config/db.js";
import monitoringRoutes from "./routes/monitoring.js";
import Monitoring from "./models/modelsMonitoring.js";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from "child_process";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(process.cwd(), "db_registry.json");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root Route
app.get("/", (req, res) => {
  res.send("💙 DEX Backend Active: AI + MongoDB Monitoring Running!");
});


function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error.message);
      if (stderr) console.warn(stderr);
      resolve(stdout);
    });
  });
}

function readDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function getFreePort(existing) {
  const usedFromDB = existing.map(d => d.port);

  let dockerPorts = [];

  try {
    const output = await run('docker ps --format "{{.Ports}}"');

    dockerPorts = output
      .split("\n")
      .map(line => {
        const match = line.match(/:(\d+)->/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(Boolean);

  } catch (err) {
    console.warn("Docker port fetch failed:", err);
  }

  const used = [...usedFromDB, ...dockerPorts];

  let port = 6333;
  while (used.includes(port)) {
    port++;
  }

  return port;
}


// -------------------- CREATE --------------------

app.post("/container/:dbCode", async (req, res) => {
  try {
    const { dbCode } = req.params;
    const { dbMetadata } = req.body;

    if (dbCode == 143) {

      const timestamp = Date.now();
      const dbName = `qdrant_${timestamp}`;
      const volume = path.join(process.cwd(), dbName);

      const existing = readDB();
      const port = await getFreePort(existing);

      // create volume dir
      if (!fs.existsSync(volume)) {
        fs.mkdirSync(volume, { recursive: true });
      }

      const cmd = `docker run -d --name ${dbName} -p ${port}:6333 -v "${volume}:/qdrant/storage" qdrant/qdrant`;

      const output = await run(cmd);
      const containerId = output.trim();

      const dbRecord = {
        dbCode,
        dbName,
        containerId,
        port,
        volume,
        url: `http://localhost:${port}`,
        metadata: dbMetadata || {},
        status: "running",
        createdAt: new Date().toISOString()
      };

      existing.push(dbRecord);
      writeDB(existing);

      res.json(dbRecord);
    }
    else {
      res.status(404).json({ error: `dbCode not found for ${dbCode}` });
    }

  } catch (err) {
  console.error("CREATE ERROR:", err);
  res.status(500).json({ error: err.message });
}
});


// -------------------- START (REUSE VOLUME) --------------------

app.post("/container/start/:dbName", async (req, res) => {
  try {
    const { dbName } = req.params;

    const dbList = readDB();
    const db = dbList.find(d => d.dbName === dbName);

    if (!db) {
      return res.status(404).json({ error: "Not found" });
    }

    // check if container exists
    try {
      await run(`docker start ${db.dbName}`);
    } catch {
      // container removed → recreate with same volume
      const cmd = `docker run -d --name ${dbName} -p ${port}:6333 -v "${volume}:/qdrant/storage" qdrant/qdrant`;

      const output = await run(cmd);
      db.containerId = output.trim();
    }

    db.status = "running";
    writeDB(dbList);

    res.json({ message: "Started", db });

  } catch (err) {
    res.status(500).json({ error: err });
  }
});


// -------------------- STOP --------------------

app.post("/container/stop/:dbName", async (req, res) => {
  try {
    const { dbName } = req.params;

    const dbList = readDB();
    const db = dbList.find(d => d.dbName === dbName);

    if (!db) {
      return res.status(404).json({ error: "Not found" });
    }

    await run(`docker stop ${db.dbName}`);

    db.status = "stopped";
    writeDB(dbList);

    res.json({ message: "Stopped", db });

  } catch (err) {
    res.status(500).json({ error: err });
  }
});


// -------------------- DELETE --------------------

app.delete("/container/:dbName", async (req, res) => {
  try {
    const { dbName } = req.params;

    const dbList = readDB();
    const db = dbList.find(d => d.dbName === dbName);

    if (!db) {
      return res.status(404).json({ error: "Not found" });
    }

    // FORCE remove container (handles running + stopped)
    try {
      await run(`docker rm -f ${db.dbName}`);
    } catch (err) {
      console.warn("Docker remove failed:", err);
    }

    // delete volume
    // clean volume safely via docker
    try {
      await run(`docker run --rm -v ${db.volume}:/data alpine rm -rf /data`);
    } catch (err) {
      console.warn("Volume cleanup failed:", err);
    }

    // update registry
    const updated = dbList.filter(d => d.dbName !== dbName);
    writeDB(updated);

    res.json({ success: true, message: "Deleted", dbName });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// -------------------- LIST --------------------

app.get("/container", (req, res) => {
  const data = readDB();
  res.json(data);
});


// -------------------- STATUS (REAL DOCKER) --------------------

app.get("/container/status", async (req, res) => {
  try {
    const dbList = readDB();

    const output = await run('docker ps -a --format "{{json .}}"');

    // 🛑 HANDLE EMPTY OUTPUT
    if (!output || !output.trim()) {
      return res.json([]);
    }

    let dockerContainers = [];

    try {
      dockerContainers = output
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.warn("Invalid JSON from docker:", line);
            return null;
          }
        })
        .filter(Boolean);
    } catch (err) {
      console.error("Parsing error:", err);
      return res.json([]); // prevent 500
    }

    const dockerMap = {};
    dockerContainers.forEach(c => {
      if (c?.Names) dockerMap[c.Names] = c;
    });

    const result = dbList.map(db => {
      const dockerInfo = dockerMap[db.dbName];

      return {
        ...db,
        dockerStatus: dockerInfo ? dockerInfo.State : "not_found",
        running: dockerInfo ? dockerInfo.State === "running" : false,
        ports: dockerInfo ? dockerInfo.Ports : null
      };
    });

    res.json(result);

  } catch (err) {
    console.error("STATUS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Static /qdrantdb route removed in favor of dynamic /api/monitoring/all
// ======================================================
// 💬 Ollama Chat API
// ======================================================
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim())
    return res.status(400).json({ reply: "⚠️ Please enter a message!" });

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: message,
        stream: false,
      }),
    });

    const data = await response.json();
    res.json({ reply: data.response || "🤖 No valid reply from Ollama." });
  } catch (err) {
    console.error("❌ Ollama Error:", err.message);
    res.status(500).json({
      reply:
        "⚠️ Ollama not reachable.\nTry running:\n1️⃣ ollama serve\n2️⃣ ollama run llama3.2:1b",
    });
  }
});

// ======================================================
// 🧩 Monitoring Routes
// ======================================================
app.use("/api/monitoring", monitoringRoutes);
console.log("✅ Monitoring routes registered at /api/monitoring");

// ======================================================
// 🩺 MongoDB Health Monitor
// ======================================================
async function checkMongoLatency(mongoUri) {
  const start = Date.now();
  const uri = (mongoUri && String(mongoUri).trim()) || process.env.MONGO_URI;
  if (!uri) return { status: "Disconnected", latency: 0 };
  let conn;
  try {
    conn = mongoose.createConnection(uri);
    await conn.asPromise();
    await conn.db.admin().ping();
    const latency = Date.now() - start;
    await conn.close();
    return { status: "Connected", latency };
  } catch (err) {
    console.error("⚠️ MongoDB Ping Error:", err?.message || err);
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

// ======================================================
// 🔄 Auto Refresh (Every 30 Seconds)
// ======================================================
async function autoRefresh() {
  try {
    const allDatabases = await Monitoring.find();

    for (let db of allDatabases) {
      let status = "Unknown";
      let latency = 0;

      if (db.dbType === "mongo") {
        const r = await checkMongoLatency(db.mongoUrl);
        status = r.status;
        latency = r.latency;
      }

      if (db.dbType === "sql" && db.mongoUrl) {
        const r = await checkMongoLatency(db.mongoUrl);
        status = r.status;
        latency = r.latency;
      }

      if (db.dbType === "qdrant") {
        let status = "Disconnected";
        let latency = 0;

        const startAll = Date.now();

        // Try all ports 6333 → 6339
        for (let port = 6333; port <= 6339; port++) {
          try {
            const start = Date.now();

            await fetch(`http://localhost:${port}/collections`);

            status = `Connected (port ${port})`;
            latency = Date.now() - start;

            // Save which port is working
            db.qdrantUrl = `http://localhost:${port}`;

            break; // stop after first success
          } catch (err) {
            console.log(`⚠️ Qdrant not running on port ${port}`);
          }
        }

        // If none worked
        if (status === "Disconnected") {
          console.log("❌ No Qdrant instance found from 6333–6339");
          latency = Date.now() - startAll;
        }
      }

      db.status1 = status;
      db.status2 = status;
      db.latency = latency;
      db.lastUpdate = new Date();

      db.analytics.push({
        time: new Date(),
        response: latency,
      });

      if (db.analytics.length > 20) db.analytics.shift();

      try {
        await db.save();
      } catch (saveError) {
        console.error("❌ Failed to save database:", db.name || db._id, saveError.message);
        // Skip this database to avoid blocking others
      }
    }

    console.log("🔁 Auto-monitoring updated");
  } catch (err) {
    console.error("❌ Auto-refresh error:", err.message);
  }
}

setInterval(autoRefresh, 30000);

// ======================================================
// 🚀 Start Server
// ======================================================
app.listen(PORT, async () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);

  // Optional: Initialize default Qdrant collection
  // try {
  //   await createCollection("default_collection", "http://qdrant:6333");
  //   console.log("🔹 Qdrant default collection initialized");
  // } catch (err) {
  //   console.error("❌ Failed to create default Qdrant collection:", err.message);
  // }
});
