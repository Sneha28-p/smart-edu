// server.js (ESM)
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";
import mongoose from "mongoose";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import authRoutes from "./routes/auth.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("RUNNING FILE:", __filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api",authRoutes);

const DEFAULT_DB = path.join(
  __dirname,
  "..",
  "..",
  "quizgenerator",
  "quiz-app",
  "mini-project",
  "db.json"
);
const SCORES_DB_PATH = process.env.SCORES_DB_PATH || DEFAULT_DB;
function getDBPath() {
  return SCORES_DB_PATH;
}

// Debug helper
app.get("/api/debug-path", (req, res) => {
  res.send("DB PATH → " + getDBPath());
});

async function safeReadJSON(filePath) {
  try {
    const data = await fsPromises.readFile(filePath, "utf8");
    return data.trim() ? JSON.parse(data) : {};
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function safeWriteJSON(filePath, obj) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, JSON.stringify(obj, null, 2), "utf8");
}

async function postWithRetry(url, body, headers = {}, maxAttempts = 4) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await axios.post(url, body, { headers });
    } catch (err) {
      const status = err.response?.status;
      if (status && status !== 429) throw err;

      if (attempt === maxAttempts) throw err;
      const delay = Math.pow(2, attempt) * 250;
      console.warn(
        `postWithRetry: attempt ${attempt} failed (status ${status}). Retrying in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function listAvailableModels(apiKey) {
  try {
    const resp = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const models = resp.data?.models || [];
    return models.map((m) =>
      typeof m === "string" ? m : m.name || m.id || JSON.stringify(m)
    );
  } catch (err) {
    console.warn(
      "listAvailableModels failed:",
      err?.response?.data || err.message || err
    );
    return [];
  }
}

function tryExtractJSON(text) {
  if (!text || typeof text !== "string") return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const sub = text.substring(first, last + 1);
      try {
        return JSON.parse(sub);
      } catch (e2) {
        return null;
      }
    }
  }
  return null;
}


// SAVE SCORE
app.post("/api/save-score", async (req, res) => {
  const { topic, score, total, timestamp, userEmail, userName } = req.body;

  if (!topic || typeof score !== "number" || typeof total !== "number") {
    return res.status(400).json({
      error:
        "Invalid payload. Required: topic (string), score (number), total (number)",
    });
  }

  const dbPath = getDBPath();

  try {
    const json = await safeReadJSON(dbPath);
    if (!Array.isArray(json.scores)) json.scores = [];

    json.scores.push({
      topic,
      score,
      total,
      timestamp: timestamp || new Date().toISOString(),
      userEmail: userEmail || null,
      userName: userName || null,
    });

    await safeWriteJSON(dbPath, json);
    return res
      .status(200)
      .json({ ok: true, saved: { topic, score, total, userEmail, userName } });
  } catch (err) {
    console.error("Error saving score:", err);
    return res.status(500).json({
      error: "Could not save score",
      details: err?.message || String(err),
    });
  }
});

app.get("/api/get-scores", async (req, res) => {
  const dbPath = getDBPath();
  const { userEmail } = req.query;

  try {
    const json = await safeReadJSON(dbPath);
    const allScores = Array.isArray(json.scores) ? json.scores : [];

    const filtered = userEmail
      ? allScores.filter((s) => s.userEmail === userEmail)
      : allScores;

    return res.json(filtered);
  } catch (err) {
    console.error("Error reading scores:", err);
    return res.status(500).json({ error: "Could not read scores file" });
  }
});


app.post("/api/generate-quiz", async (req, res) => {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const useMock =
    process.env.USE_QUIZ_MOCK === "1" ||
    process.env.NODE_ENV === "development";

  if (!topic) return res.status(400).json({ error: "Topic is required" });

  if (!apiKey) {
    if (useMock) {
      return res.json({
        questions: Array.from({ length: 10 }).map((_, i) => ({
          question: `Sample question ${i + 1} about ${topic}?`,
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
          explanation: "Sample explanation",
        })),
      });
    }
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  const preferredModels = [
    "models/gemini-flash-latest",
    "models/gemini-pro-latest",
    "models/gemini-2.5-flash",
    "models/gemini-2.5-pro",
    "models/gemini-2.0-flash",
    "models/gemini-2.0-pro-exp",
  ];

  const available = await listAvailableModels(apiKey);
  console.log("Available models:", available);

  let candidates = preferredModels.filter((p) => available.includes(p));
  if (candidates.length === 0) {
    const filtered = available.filter(
      (m) =>
        (m.includes("flash") || m.includes("pro")) &&
        !/(exp|preview|experimental)/i.test(m)
    );
    candidates = filtered.length ? filtered : available.slice();
  }

  if (!candidates || candidates.length === 0) {
    if (useMock) {
      console.warn("No candidate models found — returning mock.");
      return res.json({
        questions: Array.from({ length: 10 }).map((_, i) => ({
          question: `Sample question ${i + 1} about ${topic}?`,
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
          explanation: "Sample explanation",
        })),
      });
    }
    return res
      .status(500)
      .json({ error: "No available models for this API key" });
  }

  console.log("Model candidates (ordered):", candidates);

  const systemText = `Return valid JSON:
{
  "questions": [
    { "question": "string", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "string" }
  ]
}
Exactly 10 questions.`;

  const userText = `Create a 10-question MCQ quiz about ${topic}. Provide concise explanations.`;

  const payloads = [
    () => ({
      systemInstruction: { role: "system", parts: [{ text: systemText }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
    () => ({
      system_instruction: { role: "system", parts: [{ text: systemText }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
    () => ({
      contents: [
        { role: "user", parts: [{ text: `${systemText}\n\n${userText}` }] },
      ],
      generationConfig: { responseMimeType: "application/json" },
    }),
  ];

  for (const model of candidates) {
    const modelId = model.includes("/") ? model.split("/").pop() : model;
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
    console.log(
      "Trying model:",
      model,
      "using modelId:",
      modelId,
      "url:",
      baseUrl
    );

    for (let i = 0; i < payloads.length; i++) {
      try {
        const resp = await postWithRetry(
          baseUrl,
          payloads[i](),
          {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          4
        );

        const text =
          resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.warn("No text in response for", modelId, "payload", i);
          continue;
        }

        const parsed = tryExtractJSON(text);
        if (
          parsed?.questions &&
          Array.isArray(parsed.questions) &&
          parsed.questions.length === 10
        ) {
          console.log("Successfully generated with model:", modelId);
          return res.json(parsed);
        } else {
          console.warn(
            "Model",
            modelId,
            "returned JSON but no valid questions length=10 on payload",
            i
          );
        }
      } catch (err) {
        const status = err?.response?.status;
        console.warn(
          `Quiz generation attempt failed for model ${modelId} payload ${i}:`,
          status || err?.message || err
        );
        if (err?.response?.data)
          console.warn(
            "API response body:",
            JSON.stringify(err.response.data)
          );

        if (status === 404) {
          console.warn(
            `Model ${modelId} returned 404; trying next candidate.`
          );
          break;
        }

        if (status === 400) {
          try {
            const altUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
            console.log(
              "Trying alternate URL with ?key= for model:",
              modelId
            );
            const resp2 = await axios.post(altUrl, payloads[i](), {
              headers: { "Content-Type": "application/json" },
            });
            const text2 =
              resp2?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed2 = tryExtractJSON(text2);
            if (
              parsed2?.questions &&
              Array.isArray(parsed2.questions) &&
              parsed2.questions.length === 10
            ) {
              console.log(
                "Successfully generated with model (alternate key param):",
                modelId
              );
              return res.json(parsed2);
            }
          } catch (err2) {
            console.warn(
              "Alternate ?key attempt also failed for model",
              modelId,
              ":",
              err2?.response?.data || err2?.message || err2
            );
          }
        }
      }
    }
  }

  if (
    process.env.USE_QUIZ_MOCK === "1" ||
    process.env.NODE_ENV === "development"
  ) {
    return res.json({
      questions: Array.from({ length: 10 }).map((_, i) => ({
        question: `Sample question ${i + 1} about ${topic}?`,
        options: ["A", "B", "C", "D"],
        correctIndex: 0,
        explanation: "Sample explanation",
      })),
    });
  }

  return res
    .status(500)
    .json({ error: "Quiz generation failed — all attempts exhausted" });
});


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
      explanation: q.explanation,
    });
  });

  res.json({ score, total: quizData.questions.length, feedback });
});

// MOCK endpoint
app.post("/api/generate-quiz-mock", (req, res) => {
  res.json({
    questions: Array.from({ length: 10 }).map((_, i) => ({
      question: `Sample question ${i + 1}?`,
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "Sample explanation",
    })),
  });
});


app.get("/api/predict-from-db", (req, res) => {
  const dbPath = getDBPath();
  const { userEmail } = req.query;

  console.log("\n🔥 API HIT: /api/predict-from-db");
  console.log("Reading scores from:", dbPath);

  fs.readFile(dbPath, "utf8", (err, fileData) => {
    if (err) {
      console.error("❌ ERROR reading db.json:", err);
      return res.status(500).json({ error: "Could not read db.json" });
    }

    let json;
    try {
      json = JSON.parse(fileData);
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr);
      return res.status(500).json({ error: "Invalid JSON in db.json" });
    }

    let scores = Array.isArray(json.scores) ? json.scores : [];

    if (userEmail) {
      scores = scores.filter((s) => s.userEmail === userEmail);
    }

    if (!scores.length) {
      return res.json({ message: "No quiz scores found" });
    }

    const allScores = scores.map((s) => ({
      subject: s.topic,
      percent: (s.score / s.total) * 100,
    }));

    console.log("➡ Sending to Python:", allScores);

    const pythonScriptPath = path.join(__dirname, "predict.py");
    const pythonCmd = process.env.PYTHON_CMD || "python";

    const python = spawn(
      pythonCmd,
      [pythonScriptPath, JSON.stringify(allScores)],
      { cwd: __dirname, shell: true, windowsHide: false }
    );

    let output = "";

    python.stdout.on("data", (chunk) => {
      console.log("🐍 PYTHON:", chunk.toString());
      output += chunk.toString();
    });

    python.stderr.on("data", (chunk) => {
      console.error("🐍 PYTHON ERROR:", chunk.toString());
    });

    python.on("close", async (code) => {
      const final = output.trim();
      console.log("✅ PYTHON EXIT CODE:", code, "OUTPUT:", final);

      try {
        const jsonFile = await safeReadJSON(dbPath);
        if (!Array.isArray(jsonFile.predictions))
          jsonFile.predictions = [];
        jsonFile.predictions.push({
          prediction: final,
          timestamp: new Date().toISOString(),
          userEmail: userEmail || null,
        });
        await safeWriteJSON(dbPath, jsonFile);
      } catch (e) {
        console.warn("Could not append prediction to db.json:", e?.message || e);
      }

      res.status(200).json({
        all_scores: allScores,
        prediction: final,
      });
    });
  });
});


app.get("/api/weak-subject", (req, res) => {
  const dbPath = getDBPath();
  const { userEmail } = req.query;

  console.log("\n🔥 API HIT: /api/weak-subject");

  fs.readFile(dbPath, "utf8", (err, fileData) => {
    if (err) {
      console.error("❌ ERROR reading db.json:", err);
      return res.status(500).json({ error: "Could not read db.json" });
    }

    let json;
    try {
      json = JSON.parse(fileData);
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr);
      return res.status(500).json({ error: "Invalid JSON in db.json" });
    }

    let scores = Array.isArray(json.scores) ? json.scores : [];

    if (userEmail) {
      scores = scores.filter((s) => s.userEmail === userEmail);
    }

    if (!scores.length) {
      return res.json({
        weakSubject: null,
        percentage: null,
        message: "No quiz scores found",
      });
    }

    let weakest = null;
    let minPercent = 101;

    scores.forEach((entry) => {
      const percent = (entry.score / entry.total) * 100;
      if (percent < minPercent) {
        minPercent = percent;
        weakest = entry.topic;
      }
    });

    res.json({
      weakSubject: weakest,
      percentage: minPercent.toFixed(2),
      message: `Your weakest subject appears to be ${weakest}`,
    });
  });
});

const predictRoutePath = path.join(__dirname, "routes", "predict.js");
if (fs.existsSync(predictRoutePath)) {
  try {
    const module = await import(`./routes/predict.js`);
    const predictRoute = module.default;
    if (predictRoute) {
      app.use("/api/predict", predictRoute);
      console.log("✓ routes/predict.js loaded");
    }
  } catch (err) {
    console.warn(
      "Could not import routes/predict.js:",
      err?.message || err
    );
  }
}

const roadmapRoutePath = path.join(__dirname, "routes", "roadmap.js");
if (fs.existsSync(roadmapRoutePath)) {
  try {
    const module = await import(`./routes/roadmap.js`);
    const roadmapRoute = module.default;
    if (roadmapRoute) {
      app.use("/api/roadmap", roadmapRoute);
      console.log("✓ routes/roadmap.js loaded");
    }
  } catch (err) {
    console.warn(
      "Could not import routes/roadmap.js:",
      err?.message || err
    );
  }
}

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_predict"
  )
  .then(() => console.log("✓ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
