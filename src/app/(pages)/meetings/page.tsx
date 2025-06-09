"use client";

import { useEffect, useState } from "react";
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
        <Image src="/navbar-icons/meetings.svg" width={40} height={40} alt="meeting icon"/>
        <h2>Meetings</h2>
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
