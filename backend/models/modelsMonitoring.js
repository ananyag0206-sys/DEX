import mongoose from "mongoose";

const monitoringSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // ✅ Database type: mongo | sql | qdrant
    dbType: {
      type: String,
      enum: ["mongo", "sql", "qdrant"],
      required: true,
    },

    // ✅ Connection URL
    // - Mongo → mongodb://...
    // - SQL   → handled by Prisma
    // - Qdrant → http://qdrant:6333
    mongoUrl: { type: String, default: null },  // optional for SQL/Qdrant
    qdrantUrl: { type: String, default: null }, // <-- added Qdrant URL

    // ✅ Prisma-specific (optional for Qdrant)
    schemaPath: { type: String, default: null },
    prismaPort: { type: Number, default: null },

    userId: { type: String, required: true },

    // ✅ Monitoring fields
    status1: { type: String, default: "Unknown" },
    status2: { type: String, default: "Unknown" },
    latency: { type: Number, default: 0 },
    lastUpdate: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
    },

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