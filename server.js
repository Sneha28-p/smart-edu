import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

//  IMPORT predict.js (ESM)
const predictRoutePath = path.join(__dirname, "routes", "predict.js");

if (fs.existsSync(predictRoutePath)) {
  const module = await import("./routes/predict.js");
  const predictRoute = module.default;

  if (predictRoute) {
    app.use("/api/predict", predictRoute);
    console.log("✓ Predict route loaded");
  } else {
    console.warn("⚠ predict.js missing default export");
  }
} else {
  console.warn("⚠ predict.js file missing");
}

//  IMPORT roadmap.js (ESM)
const roadmapRoutePath = path.join(__dirname, "routes", "roadmap.js");

if (fs.existsSync(roadmapRoutePath)) {
  const module = await import("./routes/roadmap.js");
  const roadmapRoute = module.default;
  if (roadmapRoute) {
    app.use("/api/roadmap", roadmapRoute);
    console.log("✓ Roadmap API loaded");
  } else {
    console.warn("⚠ roadmap.js missing default export");
  }
} else {
  console.warn("⚠ roadmap.js file missing");
}

app.get("/", (req, res) => {
  res.send("Backend Running Successfully!");
});

// QUIZ GENERATE (Gemini API)
app.post("/api/generate-quiz", async (req, res) => {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

  const systemText = `Return valid JSON:
{
  "questions": [
    { "question": "string", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "string" }
  ]
}
Exactly 10 questions.`;

  const userText = `Create a 10-question MCQ quiz about ${topic}.`;

  const payloads = [
    () => ({
      systemInstruction: { role: "system", parts: [{ text: systemText }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { responseMimeType: "application/json" }
    }),
    () => ({
      system_instruction: { role: "system", parts: [{ text: systemText }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { responseMimeType: "application/json" }
    }),
    () => ({
      contents: [{ role: "user", parts: [{ text: `${systemText}\n\n${userText}` }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  ];

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    for (let i = 0; i < payloads.length; i++) {
      try {
        const resp = await axios.post(url, payloads[i](), {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          }
        });

        const text = resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(text);

        if (parsed?.questions?.length === 10) {
          return res.json(parsed);
        }
      } catch (err) {}
    }
  }

  return res.status(500).json({ error: "Quiz generation failed" });
});

// QUIZ EVALUATE
app.post("/api/evaluate-quiz", (req, res) => {
  const { quizData, userAnswers } = req.body;

  if (!quizData || !userAnswers)
    return res.status(400).json({ error: "Missing quiz data" });

  let score = 0;
  const feedback = [];

  quizData.questions.forEach((q, i) => {
    const correct = q.correctIndex;
    const userAns = userAnswers[i];
    const isCorrect = userAns === correct;

    if (isCorrect) score++;

    feedback.push({
      question: q.question,
      userAnswer: q.options[userAns],
      correctAnswer: q.options[correct],
      isCorrect,
      explanation: q.explanation
    });
  });

  res.json({ score, total: quizData.questions.length, feedback });
});

// QUIZ MOCK
app.post("/api/generate-quiz-mock", (req, res) => {
  res.json({
    questions: Array.from({ length: 10 }).map((_, i) => ({
      question: `Sample question ${i + 1}?`,
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "Sample explanation"
    }))
  });
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_predict")
  .then(() => console.log("✓ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
