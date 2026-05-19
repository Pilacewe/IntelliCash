import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, transactionData, savingsData } = req.body;
      const userMessage = messages[messages.length - 1].content;

      const systemInstruction = `You are IntelliCash, an expert AI financial assistant. 
You are given the user's financial data to provide personalized insights and advice.
User's Recent Transactions: ${JSON.stringify(transactionData?.slice(0, 50) || [])}
User's Savings Goals: ${JSON.stringify(savingsData || [])}

Answer the user's questions about their finances, give intelligent advice, highlight patterns (e.g., "Food expenses are higher this week"), suggest areas to save, and congratulate on savings progress. Keep answers concise, professional, and encouraging. Use a modern fintech tone. Provide HTML formatting (like bolding and bullet points) if needed. Always respond in Indonesian as the user requested an app for Indonesian tracking.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
          systemInstruction,
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  app.post("/api/gemini/insights", async (req, res) => {
    try {
      const { transactionData, savingsData } = req.body;
      
      const systemInstruction = `You are the insight engine for IntelliCash.
Analyze the user's transaction data and savings goals. Generate 3 short, actionable financial insights in Indonesian. Format them as a JSON array of strings. Do not use markdown blocks for the JSON.
Example format:
["Pengeluaran makanan naik 23% minggu ini.", "Kamu bisa menghemat Rp300.000 jika mengurangi pengeluaran hiburan.", "Target tabungan Reksadana kamu sudah tercapai 72% - Hebat!"]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Transactions: ${JSON.stringify(transactionData || [])}, Savings: ${JSON.stringify(savingsData || [])}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      res.json({ insights: JSON.parse(response.text || "[]") });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate AI insights" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
