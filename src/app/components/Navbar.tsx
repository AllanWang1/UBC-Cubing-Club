"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import "../styles/Navbar.css";
import Dashboard from "./Dashboard";
const Navbar = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: "/navbar-icons/home.svg" },
    { href: "/aboutus", label: "About Us", icon: "/navbar-icons/about.svg" },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: "/navbar-icons/leaderboard.svg",
    },
    {
      href: "/meetings",
      label: "Meetings",
      icon: "/navbar-icons/meetings.svg",
    },
    { href: "/members", label: "Members", icon: "/navbar-icons/members.svg" },
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
              <div className="navlink">
                <div className="navlinks-link-container">
                  <Image
                    src={link.icon}
                    width={20}
                    height={20}
                    alt="link icon"
                  />
                  <p>{link.label}</p>
                </div>

                {isActive(link.href) && (
                  <div className="underline">
                    <Image
                      src="/nav_underline.png"
                      width={20}
                      height={20}
                      alt="underline"
                    />
                  </div>
                )}
              </div>
            </Link>
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
