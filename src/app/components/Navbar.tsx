"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import "../styles/Navbar.css";
import Dashboard from "./Dashboard";
const Navbar = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/aboutus", label: "About Us" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/meetings", label: "Meetings & Tournaments" },
    { href: "/members", label: "Members" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href + "/") || pathname === href;
  };

  return (
    <div className="navbar">
      <ul className="navlinks">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>
              <p>{link.label}</p>
            </Link>
            {isActive(link.href) && (
              <Image src="/nav_underline.png" width={20} height={20} alt="underline" />
            )}
          </li>
        ))}
      </ul>
      <div className="profile">
        <Dashboard />
      </div>
    </div>
  );
};
export default Navbar;

