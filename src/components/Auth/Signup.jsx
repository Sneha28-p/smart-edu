import { useState } from "react";
import axios from "axios";
import "./auth.css";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

function Signup({ onSignup }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/signup`, form);
      const user = res.data.user;
      localStorage.setItem("smartEduUser", JSON.stringify(user));
      onSignup(user);
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
return(
    <div className="auth-container">
        <div className="auth-card">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <label>Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}/>
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}/>
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange}/>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" className="auth-btn">Sign Up</button>
            </form>
            <p className="switch-text">Already have an accout? <Link to="/login">Login</Link></p>
        </div>
    </div>
)
  
}

export default Signup;
