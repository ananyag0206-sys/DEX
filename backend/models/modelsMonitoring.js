import mongoose from "mongoose";

const monitoringSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // ✅ Database type: mongo | sql | qdrant
    dbType: {
      type: String,
      enum: [
        "mongo", // this is fetching the mongo db database and connecting it to the server for frther things 

        "sql",
        // "qdrant"   // ← commented for now
      ],
      required: true,
    },

    // ✅ Connection URL for the databases that need to be done 
    // - Mongo → mongodb://...
    // - SQL   → handled by Prisma
    // - Qdrant → http://qdrant:6333
    mongoUrl: { type: String, default: null },  // optional for SQL/Qdrant
    
    // qdrantUrl: { type: String, default: null }, // ← Qdrant URL (currently disabled)

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