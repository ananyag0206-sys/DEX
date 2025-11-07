import mongoose from "mongoose";

const monitoringSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mongoUrl: { type: String, required: true },
    schemaPath: { type: String },
    prismaPort: { type: Number, required: true },
    userId: { type: String, required: true },
    status1: { type: String, default: "Unknown" },
    status2: { type: String, default: "Unknown" },
    latency: { type: Number, default: 0 },
    lastUpdate: { type: String, default: new Date().toLocaleTimeString() },
    analytics: [
      {
        time: String,
        response: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Monitoring ||
  mongoose.model("Monitoring", monitoringSchema);
