"use client";

import { useEffect, useState } from "react";
import { Cube } from "../../types/Cube";
import { formatTime, getPublicURLWithPath, DNF } from "../../lib/utils";
import { MemberRecord } from "@/app/types/MemberRecord";
import Image from "next/image";
import Link from "next/link";

import "./Leaderboard.css";

const Leaderboard = () => {
  const [results, setResults] = useState<MemberRecord[]>([]);
  const [cubes, setCubes] = useState<Cube[]>([]);
  const [selectedCube, setSelectedCube] = useState<string>("3x3");
  const [resultType, setResultType] = useState<string>("single");

  useEffect(() => {
    const fetchSingleResults = async () => {
      const response = await fetch("/api/results/leaderboard");
      const res_json = await response.json();
      if (response.ok) {
        setResults(res_json);
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
      <div className="leaderboard-title">
        <Image
          src="/navbar-icons/leaderboard.svg"
          width={40}
          height={40}
          alt="leaderboard icon"
        />
        <h2>Rankings</h2>
      </div>
      <div className="leaderboard-options">
        <div className="cube-selector">
          <h3>Event</h3>
          <div className="leaderboard-cubes">
            {cubes.map((cube) => (
              <div className="leaderboard-cube-container" key={cube.cube_name}>
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
                <h3 className="leaderboard-cube-tooltip">
                  {cube.cube_name}
                </h3>
              </div>
            ))}
          </div>
        </div>
        <div className="result-type-selector">
          <button
            className={`result-type-button ${
              resultType === "single" ? "selected" : ""
            }`}
            onClick={() => setResultType("single")}
          >
            <h3>Single</h3>
          </button>
          <button
            className={`result-type-button ${
              resultType === "average" ? "selected" : ""
            }`}
            onClick={() => setResultType("average")}
          >
            <h3>Average</h3>
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Respresents</th>
              <th>Time</th>
              <th>Meeting</th>
            </tr>
          </thead>
          {resultType === "single" ? (
            <tbody>
              {results
                .filter(
                  (r) => r.cube_name === selectedCube && r.single_time_ms < DNF
                )
                .map((result) => (
                  <tr key={result.id}>
                    <td>
                      {result.single_rank === 1 ? (
                        <span className="gold">{result.single_rank}</span>
                      ) : result.single_rank === 2 ? (
                        <span className="silver">{result.single_rank}</span>
                      ) : result.single_rank === 3 ? (
                        <span className="bronze">{result.single_rank}</span>
                      ) : (
                        <span className="other-rank">{result.single_rank}</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/members/${result.id}`}>{result.name}</Link>
                    </td>
                    <td className="leaderboard-faculty">
                      <Image
                        src={`/faculty-icons/${result.faculty_icon_link}`}
                        height={16}
                        width={16}
                        alt="faculty-icon"
                      />
                      {result.faculty_full_name}
                    </td>
                    <td>{formatTime(result.single_time_ms)}</td>
                    <td>
                      <Link href={`/meetings/${result.single_meeting_id}`}>
                        {result.single_meeting_name}
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          ) : (
            <tbody>
              {results
                .filter(
                  (r) => r.cube_name === selectedCube && r.avg_time_ms < DNF / 3
                )
                .sort((a, b) => a.avg_rank - b.avg_rank)
                .map(
                  (result) =>
                    result.avg_time_ms && (
                      <tr key={result.id}>
                        <td>
                          {result.avg_rank === 1 ? (
                            <span className="gold">{result.avg_rank}</span>
                          ) : result.avg_rank === 2 ? (
                            <span className="silver">{result.avg_rank}</span>
                          ) : result.avg_rank === 3 ? (
                            <span className="bronze">{result.avg_rank}</span>
                          ) : (
                            <span className="other-rank">
                              {result.avg_rank}
                            </span>
                          )}
                        </td>
                        <td>
                          <Link href={`/members/${result.id}`}>
                            {result.name}
                          </Link>
                        </td>
                        <td className="leaderboard-faculty">
                          <Image
                            src={`/faculty-icons/${result.faculty_icon_link}`}
                            height={16}
                            width={16}
                            alt="faculty-icon"
                          />
                          {result.faculty_full_name}
                        </td>
                        <td>{formatTime(result.avg_time_ms)}</td>
                        <td>
                          <Link href={`/meetings/${result.avg_meeting_id}`}>
                            {result.avg_meeting_name}
                          </Link>
                        </td>
                      </tr>
                    )
                )}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
