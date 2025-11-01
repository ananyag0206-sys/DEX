// server.js
import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
console.log("✅ Gemini Key Loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "No message provided" });

    try {
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
            {
                prompt: [{ author: "user", content: message }],
                max_output_tokens: 500,
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
                },
            }
        );

        const botReply =
            response.data?.candidates?.[0]?.content?.[0]?.text ||
            response.data?.output_text ||
            "🤖 Sorry, I didn’t understand that.";

        res.json({ reply: botReply });
    } catch (err) {
        console.error("Gemini API error:", err.message);
        res.status(500).json({ reply: "⚠️ Oops! API request failed." });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));