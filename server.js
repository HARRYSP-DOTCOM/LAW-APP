import express from "express";
import fetch from "node-fetch"; // Note: If you are using Node 18+, you don't actually need to import fetch, it's built-in!
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ reply: "Please provide a message." });
    }

    try {
        // 2. Setup your API Key (Make sure your .env file uses this exact name)
        const apiKey = process.env.GEMINI_API_KEY; 
        
        if (!apiKey) {
            console.error("Missing API Key. Check your .env file.");
            return res.status(500).json({ reply: "Server configuration error." });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `You are a friendly Indian Legal AI Assistant. Explain legal matters in simple language that anyone can understand — no legal jargon.\n\nGive a SHORT, clear response using bullet points only. Use these sections (2-3 bullets each max):\n\n📁 Legal Category:\n📜 Applicable Laws:\n❓ Is this illegal?:\n🛡️ Your Rights:\n✅ What you should do:\n\nKeep it brief, practical, and easy to read. Avoid long paragraphs.\n\nUser Query: ${message}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log("FULL API RESPONSE:", JSON.stringify(data, null, 2));

\        if (!response.ok || !data.candidates) {
            console.error("API Error:", data);
            return res.status(response.status || 500).json({
                reply: "API Error: " + (data.error?.message || "Failed to generate response")
            });
        }

        // 4. Safely extract the AI's reply
        const reply = data.candidates[0]?.content?.parts[0]?.text || "No response from AI";

        res.json({ reply });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ reply: "Server error occurred while connecting to AI." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});