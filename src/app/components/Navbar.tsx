"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import underline from "../../public/nav_underline.png";
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
          {menu === "/" && <Image src={underline.src} width={20} height={20} alt="underline" />}
        </li>
        <li>
          <Link href="/aboutus">
            <p onClick={() => setMenu("/aboutus")}>About Us</p>
          </Link>
          {menu === "/aboutus" && <Image src={underline.src} width={20} height={20} alt="" />}
        </li>
        <li>
          <Link href="/leaderboard">
            <p onClick={() => setMenu("/leaderboard")}>Leaderboard</p>
          </Link>
          {menu === "/leaderboard" && <Image src={underline.src} width={20} height={20} alt="" />}
        </li>
        <li>
          <Link href="/tournaments">
            <p onClick={() => setMenu("/tournaments")}>Tournaments</p>
          </Link>
          {menu === "/tournaments" && <Image src={underline.src} width={20} height={20} alt="" />}
        </li>
        <li>
          <Link href="/feed">
            <p onClick={() => setMenu("/feed")}>Feed</p>
          </Link>
          {menu === "/feed" && <Image src={underline.src} width={20} height={20} alt="" />}
        </li>
      </ul>
      <div className="profile">
        <Dashboard />
      </div>
    </div>
  );
};

export default Navbar;
