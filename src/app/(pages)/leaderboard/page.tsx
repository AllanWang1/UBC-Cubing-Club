"use client";

import { useEffect, useState } from "react";
import { Cube } from "../../types/Cube";
import { formatTime, getPublicURLWithPath } from "../../lib/utils";
import Image from "next/image";
import Link from "next/link";

import "./Leaderboard.css";

interface Result {
  id: number;
  name: string;
  time_ms: number;
  meeting_name: string;
  meeting_id: number;
  cube_name: string;
  icon_link: string;
}

const Leaderboard = () => {
  const [singleResults, setSingleResults] = useState<Result[]>([]);
  const [cubes, setCubes] = useState<Cube[]>([]);
  const [selectedCube, setSelectedCube] = useState<string>("3x3");

  useEffect(() => {
    const fetchSingleResults = async () => {
      const response = await fetch("/api/results/leaderboard-single");
      const res_json = await response.json();
      if (response.ok) {
        setSingleResults(res_json);
      } else {
        console.error("Error fetching results: ", res_json.error);
      }
    };

    const fetchCubes = async () => {
      const response = await fetch("/api/cubes");
      const res_json = await response.json();
      if (response.ok) {
        setCubes(res_json);
      } else {
        console.error("Error fetching results: ", res_json.error);
      }
    };

    fetchSingleResults();
    fetchCubes();
  }, []);

  return (
    <div className="leaderboard">
      <div className="single-leaderboard">
        <h2>Single Results</h2>
        <div className="cube-selector">
          {cubes.map((cube) => (
            <button
              className={`cube-button ${
                cube.cube_name === selectedCube ? "selected" : ""
              }`}
              key={cube.cube_name}
              onClick={() => setSelectedCube(cube.cube_name)}
            >
              <Image
                className="cube-icon"
                src={getPublicURLWithPath(cube.icon_link)}
                width={50}
                height={50}
                alt="cube icon"
              ></Image>
            </button>
          ))}
        </div>
        <table>
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Name</th>
              <th>Time</th>
              <th>Meeting</th>
            </tr>
          </thead>
          <tbody>
            {singleResults
              .filter((r) => r.cube_name === selectedCube)
              .map((result, index) => (
                <tr key={result.id}>
                  <td>{index + 1}</td>
                  <td>{result.name}</td>
                  <td>{formatTime(result.time_ms)}</td>
                  <td><Link href={`/meetings/${result.meeting_id}`}>{result.meeting_name}</Link></td>
                </tr>
              ))
              }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
