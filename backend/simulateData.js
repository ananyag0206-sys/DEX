import mongoose from "mongoose";
import MonitoringData from "./models/Database.js";

mongoose.connect("mongodb://localhost:27017/monitoringDB");

setInterval(async () => {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const response = Math.floor(40 + Math.random() * 40);
  await new MonitoringData({ time, response }).save();
  console.log("Inserted:", time, response);
}, 5000);
