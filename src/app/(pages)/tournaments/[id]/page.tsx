"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/SupabaseClient";
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Tournament {
  meeting_id: number;
  name: string;
}

interface HeldEvent {
  meeting_id: number;
  cube_name: string;
  Cubes : {
    cube_name: string;
    icon_link: string;
  }
}

interface Result {
  attempt: number;
  round: number;
  id: number;
  cube_name: string;
  meeting_id: number;
  time_ms: number;
}

interface GroupedResults {
  [cube_name: string]: {
    [round: number]: {
      [id: number]: Result[];
    };
  };
};

const getPublicURLWithPath = (path: string): string => {
  if (!path) return "";
  const { data } = supabase.storage.from("cubeicons").getPublicUrl(path);
  // Get publicUrl from data if not null; if null, return null
  return data?.publicUrl ?? "";
};

const groupResults = (results: Result[]): GroupedResults => {
  const grouped: GroupedResults = {};
  for (const result of results) {
    const cube_name = result.cube_name;
    const round = result.round;
    const id = result.id;

    if (!grouped[cube_name]) {
      // Create the cube_name object if it doesn't exist
      grouped[cube_name] = {};
    }
    if (!grouped[cube_name][round]) {
      grouped[cube_name][round] = {};
    }
    if (!grouped[cube_name][round][id]) {
      grouped[cube_name][round][id] = [];
    }

    grouped[cube_name][round][id].push(result);
  }
  return grouped;
}


export default function Tournament({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = React.use(params);
  const [tournament, setTournament] = useState<Tournament>({
    meeting_id: 0,
    name: "Loading...",
  });
  const [heldEvents, setHeldEvents] = useState<HeldEvent[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  // useMemo to memoize the grouped results, avoiding recomputation on every render
  const groupedResults = useMemo(() => groupResults(results), [results]);

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

    const fetchResults = async() => {
      const response = await fetch(`/api/results/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setResults(res_json);
      } else {
        console.error("Error fetching results: ", res_json.error);
      }
    }

    fetchTournament();
    fetchHeldEvents();
    fetchResults();
  }, [id]);

  return (
    <div className="tournament">
      <Link href="/tournaments">
        <p>Back to Tournaments</p>
      </Link>
      <h2>{tournament.name}</h2>
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
              <div className="event-results">
                <h4>Results</h4>
                <ul>
                 {
                  Object.entries(groupedResults[event.cube_name] || {}).map(([round, people]) => (
                    <li key={round}>
                      <h5>Round {round}</h5>
                      <ul>
                        {Object.entries(people).map(([id, results]) => (
                          <li key={id}>
                            <h6>Member {id}</h6>
                            <ul>
                              {results.map((result) => (
                                <li key={result.attempt}>
                                  <p>{result.attempt}: {result.time_ms} ms</p>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))
                 }
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
