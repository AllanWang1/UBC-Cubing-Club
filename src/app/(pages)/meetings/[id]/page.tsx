"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatTime, getUserRole, ADMIN_ROLES } from "../../../lib/utils";
import { getPublicURLWithPath } from "../../../lib/utils";
import { Meeting } from "../../../types/Meeting";
import { HeldEvent } from "../../../types/HeldEvent";
import { Result } from "../../../types/Result";
import { supabase } from "@/app/lib/SupabaseClient";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import "./MeetingID.css";
import "./validate/validateResults.css";

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

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const router = useRouter();


  const handleStatusChange = async () => {
    const nextStatus = meeting.status === "open" ? "closed" : "open";

    const confirmed = window.confirm(
      nextStatus === "closed"
        ? "Close this meeting? Members will no longer be able to submit attempts."
        : "Reopen this meeting? Members will be able to access available attempts again."
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingStatus(true);
      setStatusError(null);

      const response = await fetch(`/api/meetings/${meeting.meeting_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update meeting status.");
      }

      setMeeting(body);
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Failed to update meeting status."
      );
    } finally {
      setChangingStatus(false);
    }
  };

  // For fetching meeting data on component mount
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
        // Changed return of API to single json object
        setMeeting(res_json);
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
      const response = await fetch(`/api/results/meeting-results/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setResults(res_json);
      } else {
        console.error("Error fetching results: ", res_json.error);
      }
    };

    // Fetch user data and determine if the user is an admin
    const fetchUserRole = async () => {
      try {
        const role = await getUserRole();
        if (role && ADMIN_ROLES.includes(role)) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching user role: ", error);
      }
    };

    const fetchMeetingInfo = async () => {
      try {
        // Wait on results of verifying the meeting exists and fetching held events
        await fetchMeeting();
        await fetchHeldEvents();
        await fetchResults();
        await fetchUserRole();
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

    // fetchMeeting();
    // fetchHeldEvents();
    // fetchResults();
    fetchMeetingInfo();
  }, [id, router]);

  useEffect(() => {
    const fetchUser = async () => {
      // Check if the meeting is closed; if so, do not perform any further checking
      // as closed meeting pages are publicly available.
      if (meeting.status === "closed") {
        return;
      }
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
      const response = await fetch(`/api/pending?meeting_id=${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setPendingResults(res_json);
      }
    };
    fetchUser();
    fetchAllPending();
  }, [router, id, meeting.status]);

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
     {isAdmin && (
      <div className="meeting-admin-actions">
        {meeting.status === "open" && (
          <Link
            className="meeting-admin-action"
            href={`/meetings/edit?meetingId=${meeting.meeting_id}`}
          >
            Edit Meeting
          </Link>
        )}

        <Link
          className="meeting-admin-action"
          href={`/meetings/${meeting.meeting_id}/validate`}
        >
          Validate Results
        </Link>

        <button
          type="button"
          className="meeting-admin-action"
          onClick={handleStatusChange}
          disabled={changingStatus}
        >
          {changingStatus
            ? "Updating..."
            : meeting.status === "open"
              ? "Close Meeting"
              : "Reopen Meeting"}
        </button>
      </div>
    )}

      {statusError && (
        <p className="meeting-status-error" role="alert">
          {statusError}
        </p>
      )}
      <ul className="meeting-events-list">
        {heldEvents.map((event) => (
          <li key={event.cube_name}>
            <div className="meeting-event-container">
              <h3>
                {event.cube_name} | Format: {event.format}
              </h3>
              <Image
                className="cube-icon"
                src={getPublicURLWithPath("cubeicons", event.Cubes.icon_link)}
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
