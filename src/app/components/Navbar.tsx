"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { User } from "@supabase/auth-js";
import { supabase } from "../lib/SupabaseClient";

import "../styles/Navbar.css";
import Dashboard from "./Dashboard";
const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [userPermission, setUserPermission] = useState<string>("all");

  const links = [
    {
      href: "/",
      label: "Home",
      icon: "/navbar-icons/home.svg",
      permission: "all",
    },
    {
      href: "/aboutus",
      label: "About Us",
      icon: "/navbar-icons/about.svg",
      permission: "all",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: "/navbar-icons/leaderboard.svg",
      permission: "all",
    },
    {
      href: "/meetings",
      label: "Meetings",
      icon: "/navbar-icons/meetings.svg",
      permission: "all",
    },
    {
      href: "/members",
      label: "Members",
      icon: "/navbar-icons/members.svg",
      permission: "all",
    },
    {
      href: "/members/membership-requests",
      label: "Memberships",
      icon: "/navbar-icons/membershipManagement.svg",
      permission: "admin",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const getUserPermission = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.member_id) {
        const response = await fetch(`/api/members/${user.user_metadata.member_id}/role`);
        const res_json = await response.json();
        if (response.ok) {
          setUserPermission("admin");
        }
      }
      // Handle no user and error cases silently, as we have the default "all" permission
    };

    getUserPermission();
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href + "/") || pathname === href;
  };

  return (
    <nav className="navbar">
      {/* Hamburger button that opens/closes the side navbar */}
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <Image
          src="/navbar-icons/hamburger.svg"
          width={30}
          height={30}
          alt="hambuger menu"
        />
      </div>
      <div className={`mobile-menu ${isOpen ? "open" : ""}`} ref={menuRef}>
        <div className="close-button" onClick={() => setIsOpen(false)}>
          <Image
            src="/navbar-icons/menu_close.svg"
            width={30}
            height={30}
            alt="close menu"
          />
        </div>
        <div className="mobile-dashboard">
          <Dashboard />
        </div>
        <div className="mobile-links">
          {links.map(
            (link) =>
              (link.permission === userPermission || link.permission === "all") && (
                <div className="mobile-link" key={link.href}>
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={`mobile-navlink ${
                        isActive(link.href) ? "active" : ""
                      }`}
                    >
                      <Image
                        src={link.icon}
                        width={20}
                        height={20}
                        alt="link icon"
                      />
                      <p>{link.label}</p>
                    </div>
                  </Link>
                </div>
              )
          )}
        </div>
      </div>
      <nav className="links">
        {links.map(
          (link) =>
            (link.permission === userPermission || link.permission === "all") && (
              <Link key={link.href} href={link.href}>
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
            )
        )}
      </nav>
      {/* </ul> */}
      <div className="profile">
        <Dashboard />
      </div>
    </nav>
  );
};
export default Navbar;
