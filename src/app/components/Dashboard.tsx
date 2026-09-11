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
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropDownRef = useRef<HTMLDivElement>(null);

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();
      setUser(fetchedUser);
      if (fetchedUser) {
        const uuid: string = fetchedUser.id;
        const response = await fetch(`/api/members?user_id=${uuid}`);
        const res_json = await response.json();
        if (response.ok) {
          setMember(res_json[0]);
          if (res_json[0].avatar_path) {
            setAvatarURL(getPublicURLWithPath("avatars", res_json[0].avatar_path));
          }
        } else {
          alert("Error fetching member data: " + res_json.error);
        }
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
    if (user) {
      if (!member) {
        alert(
          "There is no member ID associated with your account. Please contact an admin.",
        );
        setIsOpen(false);
        router.push("/access-request");
      } else {
        const memberId = member.id;
        if (memberId) {
          router.push(`/members/${memberId}`);
          setIsOpen(false);
        }
      }
    }
  };

  const handleEditProfile = () => {
    if (member) {
      router.push(`/members/edit`);
      setIsOpen(false);
    } else {
      alert(
        "There is no member ID associated with your account. Please contact an admin.",
      );
      setIsOpen(false);
      router.push("/access-request");
    }
  };

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dashboard">
      {user ? (
        <div className="dashboard-profile">
          {member ? (
            <h2>{member.name}</h2>
          ) : (
            <h2>{user.user_metadata.full_name}</h2>
          )}
          <div className="dashboard-profile-menu">
            <Image
              className="avatar"
              src={avatarURL}
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
