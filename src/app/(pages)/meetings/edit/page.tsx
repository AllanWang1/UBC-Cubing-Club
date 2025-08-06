"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Meeting } from "@/app/types/Meeting";
import { HeldEvent } from "@/app/types/HeldEvent";
import Image from "next/image";
import { getPublicURLWithPath } from "@/app/lib/utils";
import { randomScrambleForEvent } from "cubing/scramble";
import cubeDetails from "@/app/types/CubeDetails.json";

import "./MeetingIDEdit.css";

const MeetingIDEdit = () => {
  // Verify that the meeting ID is valid
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [heldEvents, setHeldEvents] = useState<HeldEvent[]>([]);
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

    fetchMeetingInfo();
  }, [router, meetingId]);

  const fetchScrambledEvents = async () => {
    const response = await fetch(
      `/api/scrambles/meeting-scrambles/meeting-scrambled-cubes?meeting_id=${meetingId}`
    );
    const res_json = await response.json();
    if (response.ok) {
      const scrambledCubes: Set<string> = new Set();
      for (const entry of res_json) {
        scrambledCubes.add(entry.cube_name);
      }
      setScrambledEvents(scrambledCubes);
    }
  };
  // Use effect on mount only to fetch scrambled events. Future fetches will be done from the button.
  useEffect(() => {
    fetchScrambledEvents();
  }, );

  const handleGenerateScramble = async (cubeName: string) => {
    // It might be easier to handle the generation of scrambles in the backend and insert them immediately

  };

  return (
    <div className="meeting-id-edit">
      <h2>{meeting?.meeting_name}</h2>
      {heldEvents.map((event) => (
        // Make below kind of into a small card, give an option to generate the scramble
        // if there is no associated scramble in the database.
        <div key={event.Cubes.cube_name} className="meeting-id-edit-event">
          <Image
            src={getPublicURLWithPath(event.Cubes.icon_link)}
            alt={event.Cubes.cube_name}
            width={50}
            height={50}
          />
          <h3>{event.cube_name}</h3>
          <button>Generate Scrambles</button>
        </div>
      ))}
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
