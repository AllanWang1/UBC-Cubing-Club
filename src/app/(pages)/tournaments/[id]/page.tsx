"use client";

import { useState, useEffect } from "react";
import React from "react";

interface Tournament {
  MeetingID: number;
  Name: string;
}

export default function Tournament({ params,}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [tournament, setTournament] = useState<Tournament>({
    MeetingID: 0,
    Name: "Loading...",
  });
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
    fetchTournament();
  }, [id]);
  return (
    <div className="tournament">
      <h2>{tournament.Name}</h2>
    </div>
  );
}
