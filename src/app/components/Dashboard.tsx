"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import type { User } from "@supabase/auth-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import "../styles/Dashboard.css";



const Dashboard = () => {
  const getPublicURLWithPath = (path: string): string => {
    if (!path) return "";
    const { data } = supabase.storage
      .from("ProfilePictures")
      .getPublicUrl(path);
    // Get publicUrl from data if not null; if null, return null
    return data?.publicUrl ?? "";
  };

  // Type the user, can either be User or null
  const [user, setUser] = useState<User | null>(null);
  const [avatarURL, setAvatarURL] = useState<string>(getPublicURLWithPath("default1.png"));
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

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
        const profilePicPath = fetchedUser.user_metadata?.profilePicURL;
        if (profilePicPath) {
          const publicURL = getPublicURLWithPath(profilePicPath);
          if (publicURL) {
            setAvatarURL(publicURL);
          }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out!");
    router.push("/");
    reloadPage();
  };

  const handleMyProfile = () => {
    if (user) {
      const memberId = user.user_metadata?.member_id;
      if (memberId) {
        router.push(`/members/${memberId}`);
        setIsOpen(false);
      } else {
        alert("There is no member ID associated with your account. Please contact an admin.");
        setIsOpen(false);
        reloadPage();
      }
    }
  }
  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dashboard">
      {user ? (
        <div className="dashboard-profile">
          {user.user_metadata.full_name ? (
            <h2>{user.user_metadata.full_name}</h2>
          ) : (
            <h2>{user.email}</h2>
          )}
          <div className="dashboard-profile-menu">
            <Image className="avatar" src={avatarURL} alt="Profile Picture" width={50} height={50} onClick={toggleIsOpen} />
            {isOpen && (
              <div className="dashboard-drop-down-menu">
                <ul>
                  <li><button onClick={handleMyProfile}>My Profile</button></li>
                  {/* <li><button>Edit Profile</button></li> */}
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
