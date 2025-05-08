"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


interface Tournament {
  meeting_id: number;
  name: string;
}

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      const response = await fetch("/api/tournaments");
      const res_json = await response.json();

      if (response.ok) {
        setTournaments(res_json);
      } else {
        console.error("Error fetching tournaments:", res_json.error);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div className="tournaments">
      <h2>Tournaments</h2>
      <ul>
        {tournaments.map((tournament) => (
          <li key={tournament.meeting_id}>
            <div className="tournament-container">
              <h3>{tournament.meeting_id}</h3>
              <Link href={`/tournaments/${tournament.meeting_id}`}>{tournament.name}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tournaments;
