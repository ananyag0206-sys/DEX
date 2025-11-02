import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import monitoringRoutes from "./routes/monitoring.js";
import Monitoring from "./models/Monitoring.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect MongoDB
connectDB();

// Root Route
app.get("/", (req, res) => {
  res.send("💙 DEX Backend Active: AI + MongoDB Monitoring Running!");
});

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
async function checkMongoLatency() {
  const start = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
    return { status: "Connected", latency: Date.now() - start };
  } catch {
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
      const { status, latency } = await checkMongoLatency();

      db.status1 = status;
      db.status2 = status;
      db.latency = latency;
      db.lastUpdate = new Date().toLocaleTimeString();

      db.analytics.push({
        time: new Date().toLocaleTimeString(),
        response: latency,
      });

      if (db.analytics.length > 20) db.analytics.shift();

      await db.save();
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
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});
