"use client";

import { useState, useEffect } from "react";
import { getUserRole, ADMIN_ROLES } from "@/app/lib/utils";
import { Meeting } from "@/app/types/Meeting";
import "./createMeeting.css";

const CreateMeeting = () => {
  const [meeting, setMeeting] = useState<Meeting>({
    meeting_id: 1,
    date: "",
    passcode: "",
    description: "",
    meeting_name: "",
    tournament: false,
    status: "open",
  });
  const [userRole, setUserRole] = useState<string>("member");

  const handleCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meeting),
    });
    const res_json = await response.json();
    if (response.ok) {
      alert(`Successfully created meeting: ${res_json.meeting_name}`);
    } else {
      alert(`Failed to create meeting: ${res_json.error}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeeting((prevMeeting) => ({
      ...prevMeeting,
      [name]: value,
    }));
  }

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      if (role) {
        setUserRole(role);
      }
    };

    fetchUserRole();
  }, []);

  return ADMIN_ROLES.includes(userRole) ? (
    <div className="create-meeting">
      <h2>Create Meeting</h2>
      <form onSubmit={handleCreation}>
        <label>Meeting Name:</label>
        <input type="text" name="meeting_name" onChange={handleChange} required />

        <label>Date:</label>
        <input type="date" name="date" onChange={handleChange} required />

        <label>Passcode:</label>
        <input type="text" name="passcode" onChange={handleChange} required />

        <label>Description:</label>
        <textarea name="description" rows={4} onChange={handleChange}></textarea>

        <button type="submit">
          Create Meeting
        </button>
      </form>
    </div>
  ) : (
    <div className="create-meeting-unauthorized">
      <h2>You do not have the access rights to create meetings</h2>
    </div>
  );
};

export default CreateMeeting;
