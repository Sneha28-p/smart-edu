import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link">
          Learn<span className="hub-badge">Hub</span>
        </Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/learning">Up Skill</Link></li>

        {user ? (
          <>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button
                onClick={onLogout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  font: "inherit",
                  padding: 0
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
