import React from "react";
import { useNavigate } from "react-router-dom";
import "./features.css";

import learningIcon from "../assets/learning2.jpg";
import roadmap from "../assets/roadmap.jpg";
import quiz from "../assets/quiz3.jpg";

const features = [
  { icon: roadmap, title: "Roadmaps", path: "/roadmaps" }, // example page
  { icon: quiz, title: "Quizzes", path: "/quiz" },
  { icon: learningIcon, title: "Insight", path: "/insight" },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section className="features">
      {features.map((f, i) => (
        <div
          className="feature-card"
          key={i}
          onClick={() => navigate(f.path)}
          style={{ cursor: "pointer" }}
        >
           <img src={f.icon} alt={f.title} className="feature-icon" />
          <h3>{f.title}</h3>
        </div>
      ))}
    </section>
  );
};

export default Features;
