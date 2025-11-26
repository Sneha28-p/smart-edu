import { useState } from "react";
import axios from "axios";
import "./roadmap.css";

export default function Roadmap() {
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    setError("");
    setRoadmap([]);

    try {
      const res = await axios.post("http://localhost:5000/api/roadmap", { topic });

      if (res.data.roadmap && res.data.roadmap.length > 0) {
        setRoadmap(res.data.roadmap);
      } else {
        setError("No roadmap found for this topic.");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching roadmap. Please check your backend.");
    }

    setLoading(false);
  };

  return (
    <div className="container">

      {/* Input + Button */}
      <div className="top-box">
        <h2>Customize Your Learning</h2>

        <div className="input-box">
          <input
            type="text"
            placeholder="Enter a topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Loading..." : "Get Roadmap"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {roadmap.length > 0 && (
        <div className="roadmap-box">
          <h3>{topic} Roadmap</h3>

          <div className="roadmap-steps">
            <ul>
              {roadmap
                .join(",")
                .split(",")
                .map((step, index) => (
                  <li key={index}>{step.trim()}</li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
