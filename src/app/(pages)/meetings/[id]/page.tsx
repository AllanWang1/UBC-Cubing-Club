"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "../../../lib/utils";
import { getPublicURLWithPath } from "../../../lib/utils";
import { Meeting } from "../../../types/Meeting";
import { HeldEvent } from "../../../types/HeldEvent";
import { Result } from "../../../types/Result";
import { supabase } from "@/app/lib/SupabaseClient";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import "./MeetingID.css";

interface ResultWithMembers {
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
      [id: number]: { name: string; results: ResultWithMembers[] };
    };
  };
}

const groupResults = (results: ResultWithMembers[]): GroupedResults => {
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
  const [results, setResults] = useState<ResultWithMembers[]>([]);
  const [pendingResults, setPendingResults] = useState<Result[]>([]);
  const [memberId, setMemberId] = useState<number>(0);

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

  useEffect(() => {
    if (meeting.status === "closed") return;
    const fetchUser = async () => {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();
      if (!fetchedUser) {
        alert("Please log in to view active meeting.");
        router.push("/signin");
        return;
      }

      const member_id = fetchedUser.user_metadata?.member_id;
      if (!member_id) {
        alert(
          "There is no member ID associated with your account. Please contact an admin."
        );
        router.push("/meetings");
        return;
      } else {
        setMemberId(member_id);
      }
    };

    const fetchAllPending = async () => {
      const response = await fetch(`/api/pending/all-pending?meeting_id=${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setPendingResults(res_json);
      }
    };
    fetchUser();
    fetchAllPending();
  }, [meeting, router, id]);

  const pendingMap = useMemo(() => {
    const map = new Set<string>();
    for (const result of pendingResults) {
      // Using this map to store labels, attempt-cube-id-round
      map.add(
        `${result.attempt}-${result.cube_name}-${result.id}-${result.round}`
      );
    }
    return map;
  }, [pendingResults]);

  return (
    <div className="meeting">
      <div className="meeting-back">
        <Image src="/back.svg" width={16} height={16} alt="back button" />
        <Link href="/meetings">
          <p>Back to all meetings</p>
        </Link>
      </div>
      <div className="meeting-info">
        <h2>{meeting.meeting_name}</h2>
        <h3>{meeting.date}</h3>
      </div>
      <ul>
        {heldEvents.map((event) => (
          <li key={event.cube_name}>
            <div className="meeting-event-container">
              <h3>{event.cube_name} | Format: {event.format}</h3>
              <Image
                className="cube-icon"
                src={getPublicURLWithPath(event.Cubes.icon_link)}
                alt="cube icon"
                width={50}
                height={50}
              ></Image>
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
                              disabled={pendingMap.has(
                                `${index + 1}-${event.cube_name}-${memberId}-${
                                  round_index + 1
                                }`
                              )}
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
