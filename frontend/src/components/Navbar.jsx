import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom";

import underline from "../assets/nav_underline.svg";
import "../styles/Navbar.css";
import Dashboard from "./Dashboard";

const Navbar = () => {
  const location = useLocation();
  console.log(location.pathname);
  const [menu, setMenu] = useState(location.pathname);
  return (
    <div className="navbar">
      <ul className="navlinks">
        <li>
          <Link to="/">
            <p onClick={() => setMenu("/")}>Home</p>
          </Link>
          {menu === "/" ? <img src={underline} alt="" /> : <></>}
        </li>
        <li>
          <Link to="/aboutus">
            <p onClick={() => setMenu("/aboutus")}>About Us</p>
          </Link>
          {menu === "/aboutus" ? <img src={underline} alt="" /> : <></>}
        </li>
        <li>
          <Link to="/leaderboard">
            <p onClick={() => setMenu("/leaderboard")}>Leaderboard</p>
          </Link>
          {menu === "/leaderboard" ? <img src={underline} alt="" /> : <></>}
        </li>
        <li>
          <Link to="/tournaments">
            <p onClick={() => setMenu("/tournaments")}>Tournaments</p>
          </Link>
          {menu === "/tournaments" ? <img src={underline} alt="" /> : <></>}
        </li>
        <li>
          <Link to="/feed">
            <p onClick={() => setMenu("/feed")}>Feed</p>
          </Link>
          {menu === "/feed" ? <img src={underline} alt="" /> : <></>}
        </li>
      </ul>
      <div className="profile">
        <Link to="/signin">
          <Dashboard />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
