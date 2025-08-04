"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Meeting } from "@/app/types/Meeting";
import { HeldEvent } from "@/app/types/HeldEvent";

import "./MeetingIDEdit.css";

const MeetingIDEdit = () => {
  // Verify that the meeting ID is valid
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [heldEvents, setHeldEvents] = useState<HeldEvent[]>([]);
  const router = useRouter();

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
      const response = await fetch(
        `/api/held-events/meeting-held-events/${meetingId}`
      );
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

  return (
    <div className="meeting-id-edit">
      <h2>{meeting?.meeting_name}</h2>
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
