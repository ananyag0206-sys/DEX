import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

import connectDB from "./config/db.js";
import monitoringRoutes from "./routes/monitoring.js";
import Monitoring from "./models/modelsMonitoring.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// 🧩 Middleware
// ======================================================
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// ======================================================
// 🧠 Connect MongoDB
// ======================================================
connectDB();

// ======================================================
// 🏠 Root Route
// ======================================================
app.get("/", (req, res) => {
  res.send("💙 DEX Backend Active: AI + MongoDB + Prisma Monitoring Running!");
});

// ======================================================
// 💬 Ollama Chat API
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
        model: "llama3.2:1b",
        prompt: message,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!data.response) {
      return res.status(500).json({ reply: "🤖 No valid reply from Ollama." });
    }

    res.json({ reply: data.response });
  } catch (err) {
    console.error("❌ Ollama Error:", err.message);
    res.status(500).json({
      reply: "⚠️ Ollama not reachable.\nTry running:\n1️⃣ ollama serve\n2️⃣ ollama run llama3.2:1b",
    });
  }
});

// ======================================================
// 🧩 Monitoring Routes (Prisma + Mongo)
// ======================================================
app.use("/api/monitoring", monitoringRoutes);
console.log("✅ Monitoring routes registered at /api/monitoring");

// ======================================================
// 📁 File Upload Route (Schema / .env / Config Files)
// ======================================================
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/monitoring/upload-schema", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: "File uploaded successfully",
      path: filePath,
      filename: req.file.originalname,
    });
  } catch (err) {
    console.error("❌ File upload error:", err);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
});

// ======================================================
// 🩺 MongoDB Health Monitor
// ======================================================
async function checkMongoLatency() {
  const start = Date.now();
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await mongoose.connection.db.admin().ping();
    return { status: "Connected", latency: Date.now() - start };
  } catch {
    return { status: "Disconnected", latency: 0 };
  }
}

// ======================================================
// 🔄 Auto Refresh / Live Monitoring
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

      db.analytics.push({ time: new Date().toLocaleTimeString(), response: latency });
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
// 🧭 Open Prisma Studio for a Database
// ======================================================
app.get("/api/monitoring/open/:id", async (req, res) => {
  try {
    const db = await Monitoring.findById(req.params.id);

    if (!db || !db.prismaPort) {
      return res.status(404).json({ success: false, message: "Database not found or no Prisma port." });
    }

    exec(`npx prisma studio --port ${db.prismaPort}`, (error) => {
      if (error) {
        console.error(`❌ Prisma Studio failed on port ${db.prismaPort}:`, error.message);
      } else {
        console.log(`🚀 Prisma Studio running on http://localhost:${db.prismaPort}`);
      }
    });

    return res.json({
      success: true,
      url: `http://localhost:${db.prismaPort}`,
      message: "Prisma Studio launched successfully.",
    });
  } catch (err) {
    console.error("❌ Error launching Prisma Studio:", err.message);
    res.status(500).json({ success: false, message: "Server error launching Prisma Studio." });
  }
});

// ======================================================
// 🚀 Start Server
// ======================================================
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});
