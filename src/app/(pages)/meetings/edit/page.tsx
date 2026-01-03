"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Meeting } from "@/app/types/Meeting";
import { HeldEvent } from "@/app/types/HeldEvent";
import Image from "next/image";
import {
  getPublicURLWithPath,
  getUserRole,
  ADMIN_ROLES,
} from "@/app/lib/utils";
import MeetingEventAdder from "@/app/components/MeetingEventAdder";
import { Scrambow } from "scrambow";
import cubeDetails from "@/app/types/CubeDetails.json";

import "./MeetingIDEdit.css";

const MeetingIDEdit = () => {
  // Verify that the meeting ID is valid
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [heldEvents, setHeldEvents] = useState<HeldEvent[]>([]);
  const [userRole, setUserRole] = useState<string>("member");
  const router = useRouter();

  const [scrambledEvents, setScrambledEvents] = useState<Set<string>>(
    new Set()
  );

  // Check that meetingId is valid, and the database contains the correct information.
  useEffect(() => {
    const fetchMeeting = async () => {
      if (!meetingId) {
        throw new Error("Meeting ID is not found in URL");
      }
      const response = await fetch(`/api/meetings/${meetingId}`);
      const res_json = await response.json();
      if (response.ok && res_json) {
        setMeeting(res_json);
        if (res_json.status === "closed") {
          throw new Error("Cannot edit closed meetings");
        }
      } else {
        throw new Error("Invalid meeting ID");
      }
    };

    const fetchHeldEvents = async () => {
      // We do not need to check any preconditions for held events, since
      // this function will only be called after fetchMeeting is successful.
      const response = await fetch(`/api/holds/${meetingId}`);
      const res_json = await response.json();
      if (response.ok) {
        setHeldEvents(res_json);
      } else {
        throw new Error("Failed to fetch held events");
      }
    };

    const fetchMeetingInfo = async () => {
      try {
        await fetchMeeting();
        await fetchHeldEvents();
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
          router.push("/meetings");
          return;
        } else {
          alert(
            "An unexpected error occurred while fetching meeting information."
          );
          router.push("/meetings");
          return;
        }
      }
    };

    const fetchUserRole = async () => {
      try {
        const role = await getUserRole();
        if (role) {
          setUserRole(role);
        }
      } catch (error) {
        alert("An error occurred while fetching user role.");
        router.push("/meetings");
        return;
      }
    };

    fetchMeetingInfo();
    fetchUserRole();
  }, [router, meetingId]);

  const fetchScrambledEvents = async () => {
    const response = await fetch(
      `/api/scrambles/meeting-scrambled-cubes?meeting_id=${meetingId}`
    );
    const res_json = await response.json();
    if (response.ok) {
      const scrambledCubes: Set<string> = new Set();
      for (const entry of res_json) {
        scrambledCubes.add(`${entry.cube_name}-${entry.round}`);
      }
      setScrambledEvents(scrambledCubes);
    }
  };

  // Use effect on mount only to fetch scrambled events. Future fetches will be done from the button.
  useEffect(() => {
    const fetchScrambledEventsInit = async () => {
      const response = await fetch(
        `/api/scrambles/meeting-scrambled-cubes?meeting_id=${meetingId}`
      );
      const res_json = await response.json();
      if (response.ok) {
        const scrambledCubes: Set<string> = new Set();
        for (const entry of res_json) {
          scrambledCubes.add(`${entry.cube_name}-${entry.round}`);
        }
        setScrambledEvents(scrambledCubes);
      }
    };
    console.log("Checked scrambled events on mount");
    fetchScrambledEventsInit();
  }, [meetingId]);

  const handleGenerateScramble = async (
    cube_name: string,
    max_attempts: number,
    round: number
  ) => {
    // It might be easier to handle the generation of scrambles in the backend and insert them immediately

    const scrambleName = cubeDetails.find(
      (cube) => cube.cube_name === cube_name
    )?.scramble_name;

    if (!scrambleName) {
      alert("There is no associated cube in database.");
    } else {
      const scrambles: string[] = [];
      const scrambler = new Scrambow(scrambleName).get(max_attempts);

      for (let i = 0; i < max_attempts; i++) {
        // console.log(scrambler[i].scramble_string);
        scrambles.push(scrambler[i].scramble_string);
      }
      // By now the scrambles are ready. We simply call the api to post into database
      for (let i = 0; i < max_attempts; i++) {
        const entry = {
          meeting_id: meetingId,
          attempt: i + 1,
          cube_name: cube_name,
          round: round,
          scramble: scrambles[i],
        };
        try {
          const response = await fetch(`/api/scrambles`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry),
          });
          if (response.ok) {
            // The scramble has been posted successfully
            fetchScrambledEvents();
            // alert("Scrambles generated successfully.");
          } else {
            throw new Error("Failed to post scramble.");
          }
        } catch (err) {
          alert("Error while inserting scramble: " + err);
          return;
        }
      }
      alert("All scrambles were generated successfully.");
    }
  };

  return ADMIN_ROLES.includes(userRole) ? (
    <div className="meeting-id-edit">
      <h2>{meeting?.meeting_name}</h2>
      <MeetingEventAdder />
      {heldEvents.map((event) => (
        <div key={event.cube_name} className="meeting-id-edit-event">
          <Image
            src={getPublicURLWithPath(event.Cubes.icon_link)}
            alt={event.Cubes.cube_name}
            width={50}
            height={50}
          />
          <h3>{event.cube_name}</h3>
          {[...Array(event.rounds)].map((_, round_index) => (
            // Make below kind of into a small card, give an option to generate the scramble
            // if there is no associated scramble in the database.
            <div key={round_index + 1} className="meeting-id-edit-round">
              <h4>Round {round_index + 1}</h4>
              <button
                onClick={() =>
                  handleGenerateScramble(
                    event.cube_name,
                    event.FormatAttempts.max_attempts,
                    round_index + 1
                  )
                }
                disabled={scrambledEvents.has(
                  `${event.cube_name}-${round_index + 1}`
                )}
              >
                Generate Scrambles
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  ) : (
    <div>
      <h2>You do not have permission to edit meetings.</h2>
    </div>
  );
};

// Wrapped in suspense boundary
export default function MeetingIDEditPage() {
  return (
    <Suspense fallback={<div>Loading Edit Page</div>}>
      <MeetingIDEdit />
    </Suspense>
  );
}
