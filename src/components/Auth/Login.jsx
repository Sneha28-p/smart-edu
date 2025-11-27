// src/components/Auth/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./auth.css";

const API_BASE_URL = "https://smart-edu-backend-cwyi.onrender.com/api";

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------
  // handle input change
  // ----------------------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ----------------------------
  // handle form submit (THIS WAS MISSING)
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, form);

      const user = res.data.user;
      localStorage.setItem("smartEduUser", JSON.stringify(user));

      onLogin(user); // send user data back to App.js
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // RENDER
  // ----------------------------
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="switch-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
