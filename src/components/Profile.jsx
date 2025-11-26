// src/components/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weakSubject, setWeakSubject] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("smartEduUser");
    if (!stored) {
      setUser(null);
      setLoading(false);
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);

    const fetchData = async () => {
      try {
        const scoreRes = await axios.get(`${API_BASE_URL}/api/get-scores`, {
          params: { userEmail: u.email },
        });

        const sorted = (scoreRes.data || []).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setScores(sorted);

        const weakRes = await axios.get(`${API_BASE_URL}/api/weak-subject`, {
          params: { userEmail: u.email },
        });
        setWeakSubject(weakRes.data || null);
        
      } catch (err) {
        console.error("");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartEduUser");
    if (onLogout) onLogout();
  };

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="profile-card">
          <h2>Your Profile</h2>
          <p>You are not logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Your Profile</h2>
          <button className="profile-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="profile-info">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>User ID:</strong> {user.id || user._id}
          </p>
        </div>

        <hr />

        <div className="profile-scores">
          <h3>Your Quiz History</h3>

          {loading ? (
            <p>Loading…</p>
          ) : scores.length === 0 ? (
            <p>You have not taken any quizzes yet.</p>
          ) : (
            <div className="scores-table-wrapper">
              <table className="scores-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{s.topic}</td>
                      <td>
                        {s.score} / {s.total}
                      </td>
                      <td>{((s.score / s.total) * 100).toFixed(1)}%</td>
                      <td>
                        {s.timestamp
                          ? new Date(s.timestamp).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {weakSubject && weakSubject.weakSubject && (
          <p style={{ marginTop: "16px" }}>
            <strong>Weakest subject:</strong> {weakSubject.weakSubject} (
            {weakSubject.percentage}%)
          </p>
        )}

        {prediction && prediction.prediction && (
          <p style={{ marginTop: "4px" }}>
            <strong>Prediction:</strong> {prediction.prediction}
          </p>
        )}
      </div>
    </div>
  );
}

export default Profile;
