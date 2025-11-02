import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/DEX")
  .then(() => {
    console.log("✅ MongoDB Connected successfully!");
    mongoose.connection.close();
  })
  .catch(err => console.error("❌ Connection failed:", err));
