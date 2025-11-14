import React from "react";
import { useNavigate } from "react-router-dom";
import "./Learning.css";

import roadmapImg from "../assets/roadmap.jpg";
import quizImg from "../assets/quiz3.jpg";
import insightImg from "../assets/learning2.jpg";

const learningItems = [
  { 
    icon: roadmapImg, 
    title: "Roadmaps", 
    path: "/roadmaps",
    contentTitle: "Custom Learning Roadmaps",
    description: "Navigate your educational journey with confidence using our personalized learning roadmaps. We design step-by-step paths that guide you from beginner to expert, ensuring you never miss a crucial concept. Whether you're starting from scratch or mastering advanced topics, our roadmaps adapt to your skill level and guide you through structured paths for success."
  },
  { 
    icon: quizImg, 
    title: "Quizzes", 
    path: "/quiz",
    contentTitle: "Quiz Generator",
    description: "Our Quiz Generator lets you instantly create customized quizzes on any topic you choose. Simply select a subject, pick a difficulty level — Easy, Medium, or Hard — and get a set of unique multiple-choice questions generated on the spot. It's designed to help learners test their knowledge, challenge themselves, and make learning fun and interactive!"
  },
  { 
    icon: insightImg, 
    title: "Insights", 
    path: "/insight",
    contentTitle: "Pass/Fail Prediction",
    description: "Stay ahead with our advanced analytics that predict your exam performance. Identify weak areas before it's too late and receive targeted recommendations to improve your chances of success. Our predictive algorithms analyze your quiz results and study habits to give you accurate insights into your readiness for exams — helping you focus where it matters most."
  },
];

const Learning = () => {
  const navigate = useNavigate();

  return (
    <section className="learning-section">
      {learningItems.map((item, index) => (
        <div className="learning-row" key={index}>
          <div
            className="learning-card"
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt={item.title} className="learning-icon" />
            <h2>{item.title}</h2>
          </div>

          <div className="learning-content">
            <h2>{item.contentTitle}</h2>
            <p className="description">{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Learning;
