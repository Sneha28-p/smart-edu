// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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

import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Profile from "./components/Profile";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("smartEduUser");
    return stored ? JSON.parse(stored) : null;
  });

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("smartEduUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem("smartEduUser");
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />

        {/* 🔹 Everything below will share the same layout width */}
        <div className="page-wrapper">
          <Routes>
            {/* If you STILL want gating, keep this part, else remove the checks */}
            {!user ? (
              <>
                <Route
                  path="/login"
                  element={<Login onLogin={handleAuthSuccess} />}
                />
                <Route
                  path="/signup"
                  element={<Signup onSignup={handleAuthSuccess} />}
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route
                  path="/"
                  element={
                    <>
                      <Hero />
                      <Features />
                    </>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/roadmaps" element={<Roadmap />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/insight" element={<PredictForm />} />
                <Route
                  path="/profile"
                  element={
                    <Profile user={user} onLogout={handleLogout} />
                  }
                />

                <Route
                  path="/login"
                  element={<Navigate to="/" replace />}
                />
                <Route
                  path="/signup"
                  element={<Navigate to="/" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
