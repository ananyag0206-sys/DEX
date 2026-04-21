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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect MongoDB
connectDB();

app.use("/uploads", express.static(path.join("C:\\Users\\anany\\Downloads\\DEX\\backend", "uploads")));

// Root Route
app.get("/", (req, res) => {
  res.send("💙 DEX Backend Active: AI + MongoDB Monitoring Running!");
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