// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/Features";
import About from "./components/about";
import Footer from "./components/footer";
import Learning from "./components/learning";
import PredictForm from "./components/PredictForm";
import Quiz from "./components/quiz";
import Roadmap from "./components/roadmap";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
            </>
          } />
          <Route path="/about" element={<About/>}/>
          <Route path="/learning" element={<Learning/>} />
          <Route path="/roadmaps" element={<Roadmap/>}/>
          <Route path="/quiz" element={<Quiz/>} />
          <Route path="/profile" element={<h1>Profile Page</h1>} />
          <Route path="/insight" element={<PredictForm/>}/>
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
