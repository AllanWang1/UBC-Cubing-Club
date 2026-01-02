"use client";

import { useEffect, useState } from "react";
import { getUserRole, ADMIN_ROLES } from "@/app/lib/utils";
import Image from "next/image";
import Link from "next/link";

import "./Meetings.css";

interface Meeting {
  meeting_id: number;
  date: string;
  passcode: string;
  description: string;
  meeting_name: string;
  tournament: boolean;
}

const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [userRole, setUserRole] = useState<string>("member");

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      if (role) {
        setUserRole(role);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchUserPermission = async () => {
      const role = await getUserRole();
      if (role) {
        setUserRole("admin");
      }
    };

    fetchUserPermission();
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      const response = await fetch("/api/meetings");
      const res_json = await response.json();

      if (response.ok) {
        setMeetings(res_json);
      } else {
        console.error("Error fetching meetings:", res_json.error);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <div className="meetings">
      <div className="meetings-title">
        <Image
          src="/navbar-icons/meetings.svg"
          width={40}
          height={40}
          alt="meeting icon"
        />
        <h2>Meetings</h2>
        {ADMIN_ROLES.includes(userRole) && (
          <Link href="/meetings/create" className="create-meeting-button">
            <span className="plus">＋</span>
            Create Meeting
          </Link>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Meeting ID</th>
            <th>Name</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => (
            <tr key={meeting.meeting_id}>
              <td>
                <h3>{meeting.meeting_id}</h3>
              </td>
              <td>
                <Link href={`/meetings/${meeting.meeting_id}`}>
                  {meeting.meeting_name}
                </Link>
              </td>
              <td>
                <p>{meeting.date}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Meetings;
