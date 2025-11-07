// db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Connect to MongoDB using connection string from .env
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn; // Optional: return connection if needed elsewhere
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
};

// Optional: listen to connection events globally
mongoose.connection.on("connected", () => console.log("MongoDB: connected"));
mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
mongoose.connection.on("disconnected", () => console.log("MongoDB: disconnected"));

export default connectDB;
