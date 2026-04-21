import mongoose from "mongoose";

const monitoringSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Database type
    dbType: {
      type: String,
      enum: ["mongo", "sql", "qdrant"],
      required: true,
    },

    // Mongo URL (required only if dbType = mongo)
    mongoUrl: {
      type: String,
      required: function () {
        return this.dbType === "mongo";
      },
    },

    // Qdrant URL (for Qdrant databases)
    qdrantUrl: { type: String, default: null },

    // Prisma-related (for SQL)
    schemaPath: {
      type: String,
      default: null,
    },
    prismaPort: {
      type: Number,
      default: null,
    },

    userId: { type: String, required: true },

    // Monitoring fields
    status1: { type: String, default: "Unknown" },
    status2: { type: String, default: "Unknown" },
    latency: { type: Number, default: 0 },

    // ✅ Use Date instead of String
    lastUpdate: {
      type: String,
      default: () => new Date().toLocaleString(),
    },

    analytics: [
      {
        time: { type: String, default: () => new Date().toLocaleString() },
        response: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error
const Monitoring =
  mongoose.models.Monitoring ||
  mongoose.model("Monitoring", monitoringSchema);

export default Monitoring;