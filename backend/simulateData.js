import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({ time: String, response: Number });
const SimPoint = mongoose.models.SimPoint || mongoose.model("SimPoint", pointSchema);

mongoose.connect("mongodb://localhost:27017/monitoringDB");

setInterval(async () => {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const response = Math.floor(40 + Math.random() * 40);
  await SimPoint.create({ time, response });
  console.log("Inserted:", time, response);
}, 5000);
