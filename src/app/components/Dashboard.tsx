"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/SupabaseClient";
import type { User } from "@supabase/auth-js";
import { useRouter } from "next/navigation";
import { getPublicURLWithPath, getUserId } from "../lib/utils";
import { Member } from "../types/Member";
import Link from "next/link";
import Image from "next/image";

import "../styles/Dashboard.css";

const Dashboard = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [avatarURL, setAvatarURL] = useState<string>(
    getPublicURLWithPath("avatars", "default1.png"),
  );
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropDownRef = useRef<HTMLDivElement>(null);

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!supabase.auth.getUser) {
        return;
      }
      const uuid = await getUserId();
      if (!uuid) {
        return;
      }
      // We do not return a single member, but rather an array of members where array size is 1
      const member_response = await fetch(`/api/members?user_id=${uuid}`);
      const member_json = await member_response.json();
      if (member_response.ok && member_json.length === 1) {
        setMember(member_json[0]);
      } else {
        alert("Error fetching member info: " + member_json.error);
        return;
      }
    };
    fetchUser();
    // Refetch whenever the Auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    // Cleanup subscription on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target as Node) &&
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out!");
    router.push("/");
    reloadPage();
  };

  const handleMyProfile = () => {
    if (member) {
      const memberId = member.id;
      if (memberId) {
        router.push(`/members/${memberId}`);
        setIsOpen(false);
      } else {
        alert(
          "There is no member ID associated with your account. Please contact an admin.",
        );
        setIsOpen(false);
        router.push("/access-request");
      }
    }
  };

  const handleEditProfile = () => {
    if (member) {
      router.push(`/members/edit`);
      setIsOpen(false);
    }
  };

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dashboard">
      {member ? (
        <div className="dashboard-profile">
          {member.name ? (
            <h2>{member.name}</h2>
          ) : (
            <h2>{member.email}</h2>
          )}
          <div className="dashboard-profile-menu">
            <Image
              className="avatar"
              src={getPublicURLWithPath("avatars", member.avatar_path)}
              alt="Profile Picture"
              width={50}
              height={50}
              onClick={toggleIsOpen}
            />
            {isOpen && (
              <div className="dashboard-drop-down-menu" ref={dropDownRef}>
                <ul>
                  <li>
                    <button onClick={handleMyProfile}>My Profile</button>
                  </li>
                  <li>
                    <button onClick={handleEditProfile}>Edit Profile</button>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Log Out</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link href="/signin">
          <p>Sign In</p>
        </Link>
      )}
    </div>
  );
};

export default Dashboard;
