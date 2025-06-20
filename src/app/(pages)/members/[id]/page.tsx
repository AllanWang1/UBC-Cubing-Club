"use client";

import React from "react";
import { useState, useEffect } from "react";
import { getPublicURLWithPath, formatTime } from "@/app/lib/utils";
import { MemberRecord } from "@/app/types/MemberRecord";
import { MemberResult } from "@/app/types/MemberResult";
import Image from "next/image";

import "./MemberID.css";
const Member = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const [memberRecords, setMemberRecords] = useState<MemberRecord[]>([]);
  // Always loading on mount/entry
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCube, setSelectedCube] = useState<string>("");
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);

  // These are the links to the cube icons that the member has participated in
  const [participatedEvents, setParticipatedEvents] = useState<string[]>([]);

  useEffect(() => {
    const fetchMemberRecords = async () => {
      try {
        const response = await fetch(`/api/members/${id}`);
        const res_json = await response.json();
        if (response.ok) {
          setMemberRecords(res_json);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMemberRecords();
  }, [id]);

  useEffect(() => {
    const fetchMemberResults = async () => {
      const response = await fetch(
        `/api/results/member-results?memberId=${id}`
      );
      const res_json = await response.json();
      if (response.ok) {
        setMemberResults(res_json);
      } else {
        console.error("Error fetching member results: ", res_json.error);
      }
    };
    fetchMemberResults();
  }, [id]);

  useEffect(() => {
    if (memberResults.length > 0) {
      const existingEvents = new Set<string>();
      for (const result of memberResults) {
        if (result.icon_link && result.cube_name) {
          existingEvents.add(result.icon_link);
        }
      }
      setParticipatedEvents(Array.from(existingEvents));
      if (existingEvents.size > 0) {
        setSelectedCube(Array.from(existingEvents)[0]);
      }
    }
  }, [memberResults]);

  return (
    <div className="member">
      {loading ? (
        <h2>Loading...</h2>
      ) : memberRecords.length > 0 ? (
        <div className="member-loaded">
          <h2>{memberRecords[0].name}</h2>
          <div className="member-faculty">
            <Image
              src={`/faculty-icons/${memberRecords[0].faculty_icon_link}`}
              width={25}
              height={25}
              alt="faculty icon"
            />
            <h3>{memberRecords[0].faculty_full_name}</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>UBC Rank</th>
                <th>Single</th>
                <th>Average</th>
                <th>UBC Rank</th>
              </tr>
            </thead>
            <tbody>
              {memberRecords.map((result) => (
                <tr key={result.cube_name}>
                  <td>
                    <div className="result-event">
                      <Image
                        src={getPublicURLWithPath(result.icon_link)}
                        width={30}
                        height={30}
                        alt="cube image"
                      ></Image>
                      <p>{result.cube_name}</p>
                    </div>
                  </td>
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
                    <p>{formatTime(result.single_time_ms)}</p>
                  </td>
                  <td>
                    {result.avg_time_ms && (
                      <p>{formatTime(result.avg_time_ms)}</p>
                    )}
                  </td>
                  <td>
                    {result.avg_rank === 1 ? (
                      <p className="gold">{result.avg_rank}</p>
                    ) : result.avg_rank === 2 ? (
                      <p className="silver">{result.avg_rank}</p>
                    ) : result.avg_rank === 3 ? (
                      <p className="bronze">{result.avg_rank}</p>
                    ) : (
                      <span className="other-rank">{result.avg_rank}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="member-all-results">
            <h3>View Results</h3>
            <div className="member-cubes">
              {participatedEvents.map((cube) => (
                <button
                  key={cube}
                  className={`cube-button ${
                    selectedCube === cube ? "selected" : ""
                  }`}
                  onClick={() => setSelectedCube(cube)}
                >
                  <Image
                    src={`/event-icons/${cube}`}
                    width={30}
                    height={30}
                    alt={`${cube}`}
                  />
                </button>
              ))}
            </div>
            <div className="member-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Meeting</th>
                    <th>Round</th>
                    <th>Place</th>
                    <th>Single</th>
                    <th>Average</th>
                    <th>Solves</th>
                  </tr>
                </thead>
                <tbody>
                  {memberResults
                    .filter((result) => result.icon_link === selectedCube)
                    .map((result) => (
                      <tr key={`${result.meeting_name}-${result.round}`}>
                        <td>{result.meeting_name}</td>
                        <td>{result.round}</td>
                        <td>
                          {result.place_in_round === 1 ? (
                            <span className="gold">
                              {result.place_in_round}
                            </span>
                          ) : result.place_in_round === 2 ? (
                            <span className="silver">
                              {result.place_in_round}
                            </span>
                          ) : result.place_in_round === 3 ? (
                            <span className="bronze">
                              {result.place_in_round}
                            </span>
                          ) : (
                            <span className="other-rank">
                              {result.place_in_round}
                            </span>
                          )}
                        </td>
                        <td>{formatTime(result.best_single_time_ms)}</td>
                        <td>
                          {result.avg_time_ms && formatTime(result.avg_time_ms)}
                        </td>
                        <td>
                          {/* {result.all_times.map((solve) => (
                        <span key={solve} className="solve-time">
                          {formatTime(solve) + " "}
                        </span>
                      ))} */}
                          <div className="member-solves-container">
                            {[...Array(5)].map((_, index) => {
                              const solve = result.all_times[index]; // may be undefined
                              return (
                                <span key={index} className="solve-time">
                                  {solve != null ? formatTime(solve) : " "}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <h2>There are no results associated with this member</h2>
      )}
    </div>
  );
};

export default Member;
