// routes/predict.js (ESM)
import express from "express";
import { predict } from "../ml.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const quiz_marks = Number(req.body.quiz_marks);
    const attendance = Number(req.body.attendance);
    const study_hours = Number(req.body.study_hours);

    if (
      Number.isNaN(quiz_marks) ||
      Number.isNaN(attendance) ||
      Number.isNaN(study_hours)
    ) {
      return res.status(400).json({ error: "Missing or invalid input values" });
    }

    const result = await Promise.resolve(predict({ quiz_marks, attendance, study_hours }));

    if (!result || typeof result.probability !== "number") {
      console.error("predict() returned unexpected result:", result);
      return res.status(500).json({ error: "Prediction failed" });
    }

    const rawProb = Math.max(0, Math.min(1, result.probability));
    const probability = Number(rawProb.toFixed(2));

    const predicted = Number(result.predicted) === 1 ? 1 : 0;

    return res.json({ predicted, probability });
  } catch (err) {
    console.error("routes/predict error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
