// src/components/PredictForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./predict.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function PredictForm() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [scores, setScores] = useState([]);
  const [weakSubject, setWeakSubject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("smartEduUser");
    if (!stored) {
      setUser(null);
      setError("Please log in to view your insights.");
      setLoading(false);
      return;
    }

    const u = JSON.parse(stored);
    setUser(u);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const predRes = await axios.get(
          `${API_BASE_URL}/api/predict-from-db`,
          { params: { userEmail: u.email } }
        );

        if (predRes.data.message === "No quiz scores found") {
          setError("You haven't taken any quizzes yet.");
          setPrediction(null);
          setScores([]);
        } else {
          setPrediction(predRes.data.prediction || null);
          setScores(predRes.data.all_scores || []);
        }

        const weakRes = await axios.get(
          `${API_BASE_URL}/api/weak-subject`,
          { params: { userEmail: u.email } }
        );
        setWeakSubject(weakRes.data || null);
      } catch (err) {
        console.error("Insights fetch error:", err?.response?.data || err);
        setError("Could not load insights. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="profile-card">
          <h2>Your Insights</h2>
          <p>{error || "Please log in to view this page."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Your Insights</h2>
        </div>

        {loading && <p>Loading your insights…</p>}

        {!loading && error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            {weakSubject && weakSubject.weakSubject && (
              <div style={{ marginBottom: "18px" }}>
                <h3>Your Weakest Subject</h3>
                <p>
                  {weakSubject.message
                    ? weakSubject.message
                    : `Your weakest subject appears to be ${weakSubject.weakSubject} (${weakSubject.percentage}%).`}
                </p>
              </div>
            )}

            {scores.length > 0 && (
              <>
                <h3>Your Performance Summary</h3>
                <div className="scores-table-wrapper">
                  <table className="scores-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Subject</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((s, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{s.subject}</td>
                          <td>{s.percent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
