"use client";

import { useState, useEffect } from "react";
import { getUserId } from "@/app/lib/utils";
import { Member } from "@/app/types/Member";
import { useRouter } from "next/navigation";
import "./MembersEdit.css";

const ProfileEditSections = ["basic", "avatar", "password"];
const MembersEdit = () => {
  // Need a way to obtain the current user's ID and display the corresponding Member
  const [section, setSection] = useState<string>("basic");
  const [member, setMember] = useState<Member | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchUserInfo = async () => {
      const uuid = await getUserId();
      if (!uuid) {
        alert("You are not logged in as a valid user");
        router.push("/signin");
        return;
      }
      // We do not return a single member, but rather an array of members where array size is 1
      const member_response = await fetch(`/api/members?user_id=${uuid}`);
      const member_json = await member_response.json();
      if (member_response.ok && member_json.length === 1) {
        setMember(member_json[0]);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="members-edit">
      <h2>Edit Profile</h2>
      {member && (
        <div className="members-edit-container">
          <div className="member-edit-info-display">
            <h3>{member.name}</h3>
            <h4>{member.membership ? "verified member" : "unpaid member"}</h4>
          </div>
          <div className="member-edit-content">
            <div className="member-edit-nav">
              <button
                className={
                  section === "basic"
                    ? "members-edit-active-button"
                    : "members-edit-inactive-button"
                }
                onClick={() => setSection("basic")}
              >
                Basic Information
              </button>
              <button
                className={
                  section === "avatar"
                    ? "members-edit-active-button"
                    : "members-edit-inactive-button"
                }
                onClick={() => setSection("avatar")}
              >
                Avatar
              </button>
              <button
                className={
                  section === "password"
                    ? "members-edit-active-button"
                    : "members-edit-inactive-button"
                }
                onClick={() => setSection("password")}
              >
                Password
              </button>
            </div>
            <div className="member-edit-control">
              {section === "basic" && (
                <div className="edit-section">
                  <h3>Basic Information</h3>
                  <label>
                    Name
                    <input type="text" defaultValue={member.name} />
                  </label>
                  <label>
                    Email
                    <input type="email" defaultValue={member.email} />
                  </label>
                  <label>
                    Faculty
                    <input type="text" defaultValue={member.faculty} />
                  </label>
                  <button>Save Changes</button>
                </div>
              )}

              {section === "avatar" && (
                <div className="edit-section">
                  <h3>Avatar</h3>
                  <div className="avatar-preview">
                    {/* Avatar component/image here */}
                  </div>
                  <input type="file" accept="image/*" />
                  <button>Upload Avatar</button>
                </div>
              )}

              {section === "password" && (
                <div className="edit-section">
                  <h3>Change Password</h3>
                  <label>
                    Current Password
                    <input type="password" />
                  </label>
                  <label>
                    New Password
                    <input type="password" />
                  </label>

                  <label>
                    Confirm New Password
                    <input type="password" />
                  </label>
                  <button>Change Password</button>
                  <button>Reset Password</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersEdit;
