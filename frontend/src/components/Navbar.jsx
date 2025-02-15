import React from "react";
import { User } from "lucide-react"
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navlinks">
        <ul>
          <li>Home</li>
          <li>About Us</li>
          <li>Leaderboard</li>
          <li>Tournaments</li>
          <li>Feed</li>
        </ul>
      </div>
      <div className="profile">
        <User size={24}/> {/* Profile icon */}
      </div>
    </div>
  );
};

export default Navbar;
