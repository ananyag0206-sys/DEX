import express from "express";
import mongoose from "mongoose";
import Monitoring from "../models/Monitoring.js";

const router = express.Router();

// 🧠 Utility
async function checkMongoLatency() {
  const start = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
    return { status: "Connected", latency: Date.now() - start };
  } catch (err) {
    return { status: "Disconnected", latency: 0 };
  }
}

// ✅ Get all databases
router.get("/all", async (req, res) => {
  try {
    const data = await Monitoring.find();
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ success: false, error: "Fetch failed" });
  }
});

// ✅ Add new database
router.post("/add", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Name required" });

    const { status, latency } = await checkMongoLatency();

    const newDB = await Monitoring.create({
      name,
      status1: status,
      status2: status,
      latency,
      lastUpdate: new Date().toLocaleTimeString(),
      analytics: [{ time: new Date().toLocaleTimeString(), response: latency }],
    });

    console.log("✅ Added:", newDB.name);
    res.json({ success: true, db: newDB });
  } catch (err) {
    console.error("❌ Add error:", err.message);
    res.status(500).json({ success: false, error: "Add failed" });
  }
});

// ✅ Update database name
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    console.log("📡 Update request →", id, name);

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid ID" });

    if (!name?.trim())
      return res.status(400).json({ success: false, error: "Name required" });

    const updated = await Monitoring.findByIdAndUpdate(
      id,
      { name, lastUpdate: new Date().toLocaleTimeString() },
      { new: true }
    );

    if (!updated) {
      console.log("⚠️ No document found for ID:", id);
      return res.status(404).json({ success: false, error: "Database not found" });
    }

    console.log("✅ Updated:", updated.name);
    res.json({ success: true, db: updated });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ success: false, error: "Update failed" });
  }
});

// ✅ Delete database
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Monitoring.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ success: false });
  }
});

export default router;
