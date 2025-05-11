"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


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
      <h2>Meetings</h2>
      <ul>
        {meetings.map((meeting) => (
          <li key={meeting.meeting_id}>
            <div className="meeting-container">
              <h3>{meeting.meeting_id}</h3>
              <Link href={`/meetings/${meeting.meeting_id}`}>{meeting.meeting_name}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Meetings;
