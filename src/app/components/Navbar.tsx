"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import underline from "../../public/nav_underline.png";
import "../styles/Navbar.css";
// import Dashboard from "./Dashboard";

const Navbar = () => {
  const pathname = usePathname();
  console.log(pathname);
  const [menu, setMenu] = useState(pathname);
  return (
    <div className="navbar">
      <ul className="navlinks">
        <li>
          <Link href="/">
            <p onClick={() => setMenu("/")}>Home</p>
          </Link>
          {menu === "/" && <img src={underline.src} alt="underline" />}
        </li>
        <li>
          <Link href="/aboutus">
            <p onClick={() => setMenu("/aboutus")}>About Us</p>
          </Link>
          {menu === "/aboutus" && <img src={underline.src} alt="" />}
        </li>
        <li>
          <Link href="/leaderboard">
            <p onClick={() => setMenu("/leaderboard")}>Leaderboard</p>
          </Link>
          {menu === "/leaderboard" && <img src={underline.src} alt="" />}
        </li>
        <li>
          <Link href="/tournaments">
            <p onClick={() => setMenu("/tournaments")}>Tournaments</p>
          </Link>
          {menu === "/tournaments" && <img src={underline.src} alt="" />}
        </li>
        <li>
          <Link href="/feed">
            <p onClick={() => setMenu("/feed")}>Feed</p>
          </Link>
          {menu === "/feed" && <img src={underline.src} alt="" />}
        </li>
      </ul>
      <div className="profile">
        {/* <Dashboard /> */}
      </div>
    </div>
  );
};

export default Navbar;
