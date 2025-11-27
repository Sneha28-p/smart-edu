import React from "react";
import { useNavigate } from "react-router-dom";
import "./hero.css";

const Hero = () => {
  const navigate = useNavigate();

  const goToLearningHub = () => {
    navigate("/learning"); 
  };

  const gotToQuiz=()=>{
    navigate("/quiz");
  }


  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Start Your Learning Journey</h1>
        <p>
          Personalized learning paths, expert-curated roadmaps, and structured
          quiz designed to support your academic and career growth. Gain
          practical knowledge, track your progress, and advance confidently toward
          your goals.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={goToLearningHub}>
            Get Started
          </button>
          <button className="btn-secondary" onClick={gotToQuiz}>
            Take Quiz
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
