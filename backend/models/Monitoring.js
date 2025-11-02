import mongoose from "mongoose";

// Define schema with safe defaults
const monitoringSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status1: { type: String, default: "Connected" },
  status2: { type: String, default: "Connected" },
  latency: { type: Number, default: 0 },
  lastUpdate: { type: String },
  analytics: [
    {
      time: String,
      response: Number,
    },
  ],
});

// Check if old collection name exists to preserve existing data
async function resolveModelName() {
  const existingCollections = (await mongoose.connection.db
    .listCollections()
    .toArray()).map((c) => c.name);

  // If old collection exists, continue using it
  if (existingCollections.includes("monitoringdatas")) {
    return "MonitoringData";
  }

  // Otherwise, use the new name
  return "Monitoring";
}

// Dynamically register the model (avoids duplicate compilation errors)
let Monitoring;
if (mongoose.models.MonitoringData) {
  Monitoring = mongoose.models.MonitoringData;
} else if (mongoose.models.Monitoring) {
  Monitoring = mongoose.models.Monitoring;
} else {
  // Default placeholder model; name will be updated after connection
  Monitoring = mongoose.model("Monitoring", monitoringSchema);

  // When connected, adjust to the right collection name
  mongoose.connection.once("open", async () => {
    const modelName = await resolveModelName();

    if (!mongoose.models[modelName]) {
      mongoose.model(modelName, monitoringSchema);
      console.log(`✅ Using collection: ${modelName}`);
    }
  });
}

export default Monitoring;
