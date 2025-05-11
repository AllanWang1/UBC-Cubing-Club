"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import "../styles/Navbar.css";
import Dashboard from "./Dashboard";

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
          {menu === "/" && <Image src="/nav_underline.png" width={20} height={20} alt="underline" />}
        </li>
        <li>
          <Link href="/aboutus">
            <p onClick={() => setMenu("/aboutus")}>About Us</p>
          </Link>
          {menu === "/aboutus" && <Image src="/nav_underline.png" width={20} height={20} alt="" />}
        </li>
        <li>
          <Link href="/leaderboard">
            <p onClick={() => setMenu("/leaderboard")}>Leaderboard</p>
          </Link>
          {menu === "/leaderboard" && <Image src="/nav_underline.png" width={20} height={20} alt="" />}
        </li>
        <li>
          <Link href="/meetings">
            <p onClick={() => setMenu("/meetings")}>Meetings & Tournaments</p>
          </Link>
          {menu === "/meetings" && <Image src="/nav_underline.png" width={20} height={20} alt="" />}
        </li>
        <li>
          <Link href="/members">
            <p onClick={() => setMenu("/members")}>Members</p>
          </Link>
          {menu === "/members" && <Image src="/nav_underline.png" width={20} height={20} alt="" />}
        </li>
      </ul>
      <div className="profile">
        <Dashboard />
      </div>
    </div>
  );
};

export default Navbar;
