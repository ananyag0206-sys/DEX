import mongoose from "mongoose";

// Schema definition
const monitoringSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status1: { type: String, default: "Connected" },
  status2: { type: String, default: "Connected" },
  latency: { type: Number, default: 0 },
  lastUpdate: { type: String, default: new Date().toLocaleTimeString() },
  analytics: [
    {
      time: String,
      response: Number,
    },
  ],
});

// 🧠 Migration-safe model loader
let Monitoring;

// Avoid model overwrite errors
if (mongoose.models.Monitoring) {
  Monitoring = mongoose.models.Monitoring;
} else if (mongoose.models.MonitoringData) {
  Monitoring = mongoose.models.MonitoringData;
} else {
  Monitoring = mongoose.model("Monitoring", monitoringSchema);
}

export default Monitoring;
