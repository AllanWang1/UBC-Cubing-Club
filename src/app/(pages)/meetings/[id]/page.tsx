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
    /**
     * Fetch the meeting data from the API using the meeting ID.
     * Check if the meeting exists, if not, redirect to the meetings page.
     */
    const fetchMeeting = async () => {
      const response = await fetch(`/api/meetings/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        // Check if an empty array is returned -> there is no associated meeting for the given ID.
        if (res_json.length === 0) {
          throw new Error("No meeting found with the given ID.");
        }
        // The API returns an array, so access the first (only) element.
        setMeeting(res_json[0]);
      } else {
        throw new Error("Error: " + res_json.status);
      }
    };

    const fetchHeldEvents = async () => {
      const response = await fetch(`/api/holds/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setHeldEvents(
          res_json.sort(
            (a: HeldEvent, b: HeldEvent) => a.Cubes.order - b.Cubes.order
          )
        );
      } else {
        console.error("Error fetching held events: ", res_json.error);
        return;
      }
    };

    const fetchResults = async () => {
      // We only need results for closed meetings
      if (meeting.status === "open") return;
      const response = await fetch(`/api/results/meeting-results/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setResults(res_json);
      } else {
        console.error("Error fetching results: ", res_json.error);
      }
    };

    const fetchMeetingInfo = async () => {
      try {
        // Wait on results of verifying the meeting exists and fetching held events
        await fetchMeeting();
        await fetchHeldEvents();
        await fetchResults();
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert("Error fetching meeting data: " + error.message);
        } else {
          alert("An unknown error occurred while fetching meeting data.");
        }
        router.push("/meetings");
        return;
      }
    };

    fetchMeetingInfo();
  }, [id, router, meeting.status]);

  // For active meetings, we need to check whether the meeting is closed.
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
      <ul className="meeting-events-list">
        {heldEvents.map((event) => (
          <li key={event.cube_name}>
            <div className="meeting-event-container">
              <h3>
                {event.cube_name} | Format: {event.format}
              </h3>
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
                // The below is for unopened meetings
                <div className="event-results">
                  {event.format !== "head-to-head" && (
                    <div className="regular-event-results">
                      <h4>Results</h4>
                      <ul className="event-results-list">
                        {Object.entries(
                          groupResults(results)[event.cube_name] || {}
                        ).map(([round, people]) => (
                          <li key={round}>
                            <h5>Round {round}</h5>
                            <ul className="round-results-list">
                              {Object.entries(people).map(([id, entry]) => (
                                <li key={id}>
                                  <div className="round-member-results">
                                    <h6>{entry.name}</h6>
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>Attempt</th>
                                          <th>Time</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {entry.results
                                          .sort((a, b) => a.attempt - b.attempt)
                                          .map((result) => (
                                            <tr key={result.attempt}>
                                              <td>{result.attempt}</td>
                                              <td>
                                                {formatTime(result.time_ms)}
                                              </td>
                                            </tr>
                                          ))}
                                      </tbody>
                                    </table>
                                  </div>
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
