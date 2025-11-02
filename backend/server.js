// ==============================
// 🌐 DEX Unified Backend Server
// Handles:
// 1. AI Chat via Ollama
// 2. MongoDB Database Monitoring (with live analytics)
// ==============================

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import monitoringRoutes from "./routes/monitoring.js"; // ✅ Use monitoring.js
import Monitoring from "./models/Monitoring.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧩 Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 🧠 MongoDB Connection
connectDB();

// 💬 Root Route
app.get("/", (req, res) => {
  res.send("💙 DEX Backend Active: AI + MongoDB Monitoring Running!");
});

// ======================================================
// 💬 AI Chat Route (Ollama Integration)
// ======================================================
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ reply: "⚠️ Please enter a message!" });
  }

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b", // ✅ or "phi3:mini-3b"
        prompt: message,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!data || !data.response) {
      console.warn("⚠️ Ollama responded without valid data:", data);
      return res.json({ reply: "🤖 No valid reply from Ollama." });
    }

    res.json({ reply: data.response });
  } catch (err) {
    console.error("❌ Ollama request failed:", err.message);
    res.status(500).json({
      reply:
        "⚠️ Ollama not reachable.\nTry running:\n1️⃣ ollama serve\n2️⃣ ollama run llama3.2:1b",
    });
  }
});

// ======================================================
// 🧩 Monitoring Routes (CRUD + Analytics)
// ======================================================
app.use("/api/monitoring", monitoringRoutes);
console.log("✅ Monitoring routes registered at /api/monitoring");

// ======================================================
// 🔄 Automatic Health & Analytics Updater
// ======================================================
async function autoRefresh() {
  try {
    const allDatabases = await Monitoring.find();

    for (let db of allDatabases) {
      const start = Date.now();
      let status = "Connected";

      try {
        await mongoose.connection.db.command({ ping: 1 });
      } catch {
        status = "Disconnected";
      }

      const latency = Date.now() - start;

      db.status1 = status;
      db.status2 = status;
      db.lastUpdate = new Date().toLocaleTimeString();
      db.latency = latency;

      // Push analytics data
      db.analytics.push({
        time: new Date().toLocaleTimeString(),
        response: latency,
      });

      // Keep max 20 data points
      if (db.analytics.length > 20) db.analytics.shift();

      await db.save();
    }

    console.log("🔁 Auto-monitoring data refreshed");
  } catch (err) {
    console.error("❌ Auto-refresh error:", err.message);
  }
}

// Schedule refresh every 30 seconds
setInterval(autoRefresh, 30000); // Every 30s

// ======================================================
// 🚀 Start Server
// ======================================================
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});
