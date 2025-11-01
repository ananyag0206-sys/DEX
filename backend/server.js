// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Ollama } from "@langchain/ollama";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required." });

  console.log("🟢 Message received from frontend:", message);

  try {
    // ✅ Use a small model that fits your system memory
    const model = new Ollama({
      model: "phi3:mini", // change from llama3 to phi3:mini (lightweight model)
      baseUrl: "http://localhost:11434", // ensure correct Ollama server address
    });

    console.log("⚙️ Sending prompt to Ollama...");

    const response = await model.invoke(message);

    // ✅ Ensure text is extracted properly
    const replyText = typeof response === "string" ? response : response.text || "No response";

    console.log("✅ Ollama replied:", replyText);
    res.json({ reply: replyText });
  } catch (error) {
    console.error("❌ Error connecting to Ollama:", error.message);
    res.status(500).json({ reply: "Error connecting to Ollama." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
