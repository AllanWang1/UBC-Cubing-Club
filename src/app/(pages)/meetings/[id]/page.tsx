"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "../../../lib/utils";
import { getPublicURLWithPath } from "../../../lib/utils";
import { Meeting } from "../../../types/Meeting";
import { HeldEvent } from "../../../types/HeldEvent";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import "./TournamentID.css";

interface Result {
  attempt: number;
  round: number;
  id: number;
  cube_name: string;
  meeting_id: number;
  time_ms: number;
  record: boolean;
  average_record: boolean;
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

export default function MeetingView({
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
    status: "closed",
  });
  const [heldEvents, setHeldEvents] = useState<HeldEvent[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const router = useRouter();

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
              <h4>Format: {event.format}</h4>
              {meeting.status === "open" ? (
                <>
                  {[...Array(event.rounds)].map((_, round_index) => (
                    <div className="rounds" key={round_index}>
                      <h4>Round {round_index + 1}</h4>
                      <div className="round-submissions">
                        {[...Array(event.FormatAttempts.max_attempts)].map(
                          (_, index) => (
                            <button
                              key={index + 1}
                              onClick={() =>
                                // pass in everything except for the ID of the member
                                router.push(
                                  `/timer?meeting_id=${
                                    meeting.meeting_id
                                  }&round=${round_index + 1}&attempt=${
                                    index + 1
                                  }&cube_name=${event.cube_name}`
                                )
                              }
                            >
                              <p>Attempt {index + 1}</p>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="event-results">
                  {event.format !== "head-to-head" && (
                    <div className="regular-event-results">
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
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
