// src/components/PredictForm.jsx
import React, { useState } from "react";
import "./predict.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function PredictForm() {
  const [prediction, setPrediction] = useState(null);
  const [weakSubject, setWeakSubject] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPrediction = async () => {
    setLoading(true);
    setError("");
    setPrediction(null);
    setWeakSubject(null);
    setScores([]);

    try {
      // 1️⃣ Fetch prediction + all quiz scores from integrated server
      const res = await fetch(`${API_BASE_URL}/api/predict-from-db`);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Predict request failed: ${res.status} ${text}`);
      }
      const data = await res.json();
      console.log("Predict-from-db:", data);

      // Safety: ensure all_scores exists and is an array
      if (Array.isArray(data.all_scores) && data.all_scores.length > 0) {
        setScores(data.all_scores);
      } else {
        setScores([]); // avoid undefined
      }

      setPrediction(data.prediction ?? null);

      // 2️⃣ Fetch weakest subject (use /api/ prefix)
      const weak = await fetch(`${API_BASE_URL}/api/weak-subject`);
      if (!weak.ok) {
        const text = await weak.text().catch(() => "");
        throw new Error(`Weak-subject request failed: ${weak.status} ${text}`);
      }
      const weakData = await weak.json();
      console.log("Weakest subject:", weakData);

      setWeakSubject(weakData);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred while fetching the prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="PredictForm">
      <h1>Student Prediction (Auto from Quiz)</h1>

      <button className="btn" onClick={getPrediction} disabled={loading}>
        {loading ? "Loading..." : "Get Auto Prediction"}
      </button>

      {error && <p className="error-message">{error}</p>}

      {/* Only show results if scores array exists */}
      {Array.isArray(scores) && scores.length > 0 && (
        <div className="prediction-box">

          {/* ALL SCORES */}
          <h2>All Quiz Scores Used</h2>
          <ul>
            {scores.map((s, i) => (
              <li key={i}>
                <b>{s.subject}</b> — {Number(s.percent).toFixed(2)}%
              </li>
            ))}
          </ul>

          {/* PREDICTION */}
          <h2>Prediction Result</h2>
          <p>
            {prediction === null|| prediction === undefined || prediction === ""?(
              "-No prediction returned"
            ):String(prediction).trim()==="1"?(
              "Student likely to pass"
            ):String(prediction).trim()==="0"?(
              "needs improvement"
            ):(
              `Result:${String(prediction).trim()}`
            )}
          </p>

          {/* WEAKEST SUBJECT */}
          {weakSubject && weakSubject.weakSubject && (
            <>
              <h2>Weakest Subject</h2>
              <p><b>Subject:</b> {weakSubject.weakSubject}</p>
              <p><b>Score:</b> {weakSubject.percentage}%</p>
            </>
          )}
        </div>
      )}

      {/* If no scores yet, show a hint */}
      {Array.isArray(scores) && scores.length === 0 && !loading && (
        <p className="muted">No quiz scores found. Take some quizzes or seed <code>db.json</code>.</p>
      )}
    </div>
  );
}
