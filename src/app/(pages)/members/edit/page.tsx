"use client";

import { useState, useEffect } from "react";
import { getUserId } from "@/app/lib/utils";
import "./MembersEdit.css"

const MembersEdit = () => {

  // Need a way to obtain the current user's ID and display the corresponding Member
  const [section, setSection] = useState<string>("avatar");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const uuid = await getUserId();
      if (uuid) {
        setUserId(uuid);
      }
    }
    
    fetchUserInfo();
  }, [])
  return (
    <div className="members-edit">
      <h2>Edit Profile</h2>
    </div>
  )
}

export default MembersEdit
