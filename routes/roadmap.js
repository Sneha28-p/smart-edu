// routes/roadmap.js (ESM)
import express from "express";
import Roadmap from "../models/Roadmap.js";
import { spawn } from "child_process";

const router = express.Router();

router.post("/", async (req, res) => {
  const { topic } = req.body;

  try {
    // Escape regex special characters
    const escapeRegex = (text) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1️⃣ Try direct DB match first (case-insensitive)
    const data = await Roadmap.findOne({
      topic: { $regex: new RegExp(escapeRegex(topic), "i") },
    });

    if (data) {
      return res.json({ source: "db", roadmap: data.steps });
    }

    // 2️⃣ If not found → call Python ML script
    const pythonProcess = spawn("python", ["backend/ml/predict.py", topic]);

    let predicted = "";

    pythonProcess.stdout.on("data", (data) => {
      predicted += data.toString();
    });

    pythonProcess.on("close", async () => {
      predicted = predicted.trim();

      // ML model found nothing
      if (predicted === "NO_MATCH" || !predicted) {
        return res.json({
          message: "No roadmap found for this topic.",
          roadmap: [],
        });
      }

      // Look up predicted topic in DB
      const mlData = await Roadmap.findOne({
        topic: { $regex: new RegExp(predicted, "i") },
      });

      if (!mlData) {
        return res.json({
          message: "No roadmap found for this topic.",
          roadmap: [],
        });
      }

      return res.json({
        source: "ml",
        predictedTopic: predicted,
        roadmap: mlData.steps,
      });
    });
  } catch (err) {
    console.error("roadmap route error:", err);
    res.status(500).send("Server Error");
  }
});

export default router;
