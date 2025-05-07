"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/SupabaseClient";
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Tournament {
  MeetingID: number;
  Name: string;
}

interface HeldEvent {
  meeting_id: number;
  cube_name: string;
  Cubes : {
    cube_name: string;
    icon_link: string;
  }
}

const getPublicURLWithPath = (path: string): string => {
  if (!path) return "";
  const { data } = supabase.storage.from("cubeicons").getPublicUrl(path);
  // Get publicUrl from data if not null; if null, return null
  return data?.publicUrl ?? "";
};

export default function Tournament({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [tournament, setTournament] = useState<Tournament>({
    MeetingID: 0,
    Name: "Loading...",
  });
  const [heldEvents, setHeldEvents] = useState<HeldEvent[]>([]);

  useEffect(() => {
    const fetchTournament = async () => {
      const response = await fetch(`/api/tournaments/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        // The API returns an array, so access the first (only) element.
        setTournament(res_json[0]);
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

    fetchTournament();
    fetchHeldEvents();
  }, [id]);
  return (
    <div className="tournament">
      <Link href="/tournaments">
        <p>Back to Tournaments</p>
      </Link>
      <h2>{tournament.Name}</h2>
      <ul>
        {heldEvents.map((event) => (
          <li key={event.cube_name}>
            <div className="tournament-event-container">
              <h3>{event.cube_name}</h3>
              <Image
                className="cube-icon"
                src={getPublicURLWithPath(event.Cubes.icon_link)}
                alt="cube icon"
                width={50}
                height={50}
              ></Image>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
