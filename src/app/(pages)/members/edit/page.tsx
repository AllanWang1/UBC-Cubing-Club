"use client";

import { useState, useEffect } from "react";
import { getUserId } from "@/app/lib/utils";
import { Member } from "@/app/types/Member";
import { useRouter } from "next/navigation";
import { FACULTIES } from "@/app/lib/utils";
import Cropper from "react-easy-crop";
import Image from "next/image";
import "./MembersEdit.css";

const ProfileEditSections = ["basic", "avatar", "password"];
type BasicInformationProps = {
  name: string;
  faculty: string;
  WCAId: string;
  birthDate: Date;
};

const MembersEdit = () => {
  // Need a way to obtain the current user's ID and display the corresponding Member
  const [section, setSection] = useState<string>("avatar");
  const [member, setMember] = useState<Member | null>(null);
  const [basicEditor, setBasicEditor] = useState<BasicInformationProps>({
    name: "",
    faculty: "",
    WCAId: "",
    birthDate: new Date(),
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  // const handleBasicChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  // ) => {
  //   const { name, value } = e.target;
  //   setBasicEditor((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

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
  }, [router]);

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
            <nav className="member-edit-nav">
              {ProfileEditSections.map((item) => (
                <button
                  key={item}
                  className={section === item ? "active" : ""}
                  onClick={() => setSection(item)}
                >
                  {/* {item === "basic" && "Basic Information"} */}
                  {item === "avatar" && "Avatar"}
                  {item === "password" && "Password"}
                </button>
              ))}
            </nav>
            <div className="member-edit-control">
              {/* {section === "basic" && (
                <div className="edit-section">
                  <h3>Basic Information</h3>
                  <form action="">
                    <label>
                      Name
                      <input
                        type="text"
                        defaultValue={member.name}
                        onChange={(e) => {
                          handleBasicChange(e);
                        }}
                      />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        defaultValue={member.email}
                        onChange={(e) => {
                          handleBasicChange(e);
                        }}
                      />
                    </label>
                    <label>
                      WCA ID
                      <input
                        type="text"
                        defaultValue={member.wca_id}
                        onChange={(e) => {
                          handleBasicChange(e);
                        }}
                      />
                    </label>
                    <label>
                      Faculty
                      <select
                        name="Faculty"
                        defaultValue={member.faculty}
                        onChange={(e) => {
                          handleBasicChange(e);
                        }}
                      >
                        {FACULTIES.map((faculty) => (
                          <option key={faculty} value={faculty}>
                            {faculty}
                          </option>
                        ))}
                      </select>
                    </label>
                  </form>
                  <button>Save Changes</button>
                </div>
              )} */}

              {section === "avatar" && (
                <div className="edit-section">
                  <h3>Avatar</h3>

                  {avatarPreview && (
                    <>
                      <div className="avatar-crop-container">
                        <Cropper
                          image={avatarPreview}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          cropShape="round"
                          showGrid={false}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                        />
                      </div>

                      <div className="avatar-zoom-control">
                        <span>-</span>

                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.01}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                        />

                        <span>+</span>
                      </div>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;

                      if (file) {
                        setAvatarFile(file);
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                      }
                    }}
                  />

                  <button disabled={!avatarFile}>
                    Upload Avatar
                  </button>
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
                  <button>Forgot Password?</button>
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
