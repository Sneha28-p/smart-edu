import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
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
        <li>Profile</li>
      </ul>
    </nav>
  );
};

export default Navbar;
