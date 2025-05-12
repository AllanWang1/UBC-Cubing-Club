"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/SupabaseClient";
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Meeting {
  meeting_id: number;
  date: string;
  passcode: string;
  description: string;
  meeting_name: string;
  tournament: boolean;
}

interface HeldEvent {
  meeting_id: number;
  cube_name: string;
  Cubes: {
    cube_name: string;
    icon_link: string;
  };
}

interface Result {
  attempt: number;
  round: number;
  id: number;
  cube_name: string;
  meeting_id: number;
  time_ms: number;
  Members: {
    id: number;
    name: string;
  };
}

interface GroupedResults {
  [cube_name: string]: {
    [round: number]: {
      [id: number]: { name: string; results: Result[] };
    };
  };
}

const getPublicURLWithPath = (path: string): string => {
  if (!path) return "";
  const { data } = supabase.storage.from("cubeicons").getPublicUrl(path);
  // Get publicUrl from data if not null; if null, return null
  return data?.publicUrl ?? "";
};

const groupResults = (results: Result[]): GroupedResults => {
  const grouped: GroupedResults = {};
  for (const result of results) {
    const cube_name = result.cube_name;
    const round = result.round;
    const id = result.id;
    const name = result.Members.name;

    if (!grouped[cube_name]) {
      // Create the cube_name object if it doesn't exist
      grouped[cube_name] = {};
    }
    if (!grouped[cube_name][round]) {
      grouped[cube_name][round] = {};
    }
    if (!grouped[cube_name][round][id]) {
      grouped[cube_name][round][id] = {
        name: name,
        results: [],
      };
    }
    grouped[cube_name][round][id].results.push(result);
  }
  console.log("Grouped results: ", grouped);
  return grouped;
};

const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  if (minutes === 0) {
    return `${seconds.toString()}.${centiseconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
};

export default function Meeting({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [meeting, setMeeting] = useState<Meeting>({
    meeting_id: 0,
    date: "",
    passcode: "",
    description: "",
    meeting_name: "Loading...",
    tournament: false,
  });
  const [heldEvents, setHeldEvents] = useState<HeldEvent[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const fetchTournament = async () => {
      const response = await fetch(`/api/meetings/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        // The API returns an array, so access the first (only) element.
        setMeeting(res_json[0]);
      } else {
        console.error("Error fetching tournament: ", res_json.error);
      }
    };

    const fetchHeldEvents = async () => {
      const response = await fetch(`/api/holds/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setHeldEvents(res_json);
      } else {
        console.error("Error fetching held events: ", res_json.error);
      }
    };

    const fetchResults = async () => {
      const response = await fetch(`/api/results/meeting-results/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setResults(res_json);
      } else {
        console.error("Error fetching results: ", res_json.error);
      }
    };

    fetchTournament();
    fetchHeldEvents();
    fetchResults();
  }, [id]);

  return (
    <div className="meetings">
      <Link href="/meetings">
        <p>Back to all meetings</p>
      </Link>
      <h2>{meeting.meeting_name}</h2>
      <ul>
        {heldEvents.map((event) => (
          <li key={event.cube_name}>
            <div className="meeting-event-container">
              <h3>{event.cube_name}</h3>
              <Image
                className="cube-icon"
                src={getPublicURLWithPath(event.Cubes.icon_link)}
                alt="cube icon"
                width={50}
                height={50}
              ></Image>
              <div className="event-results">
                <h4>Results</h4>
                <ul>
                  {Object.entries(
                    groupResults(results)[event.cube_name] || {}
                  ).map(([round, people]) => (
                    <li key={round}>
                      <h5>Round {round}</h5>
                      <ul>
                        {Object.entries(people).map(([id, entry]) => (
                          <li key={id}>
                            <h6>
                              Member {id}: {entry.name}
                            </h6>
                            <ul>
                              {entry.results.map((result) => (
                                <li key={result.attempt}>
                                  <p>
                                    {result.attempt}:{" "}
                                    {formatTime(result.time_ms)}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
