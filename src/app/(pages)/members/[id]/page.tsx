"use client";

import React from "react";
import { useState, useEffect } from "react";
import { getPublicURLWithPath, formatTime } from "@/app/lib/utils";
import { MemberRecord } from "@/app/types/MemberRecord";
import { MemberResult } from "@/app/types/MemberResult";

import { Radar } from "react-chartjs-2";
import Image from "next/image";

import "./MemberID.css";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

// Register ChartJS components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const Member = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const [memberRecords, setMemberRecords] = useState<MemberRecord[]>([]);
  // Always loading on mount/entry
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCube, setSelectedCube] = useState<string>("");
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);

  // These are the links to the cube icons that the member has participated in
  const [participatedEvents, setParticipatedEvents] = useState<string[]>([]);
  const [WCAId, setWCAId] = useState<string>("");

  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        // Fix range to 0 and 100
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "rgba(0, 0, 0, 0)", // Optional: makes ticks more readable
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  };

  const radarData = {
    labels: [
      "NxN",
      "Non-cubic",
      "Consistency", // Coefficient of deviation
      "Versatility",
      "Growth",
      "Persistence",
    ],
    datasets: [
      {
        label: "data",
        data: [89, 20, 88, 30, 90, 100],
        fill: true,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(54, 162, 235)",
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(54, 162, 235)",
      },
    ],
  };

  // Fetch member records
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

    const fetchMemberWCAId = async () => {
      const response = await fetch(`/api/members/${id}/wca-id`);
      // since we performed .single() in the route, we know the response is not an array
      const res_json = await response.json();
      if (response.ok) {
        setWCAId(res_json.wca_id);
      } else {
        alert("Error fetching WCA ID: " + res_json.error);
      }
    };

    fetchMemberRecords();
    fetchMemberWCAId();
  }, [id]);

  // Fetch member's history results
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

  // Determining the events that the member has participated in
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
          {/* <div className="member-radar-chart">
            <Radar data={radarData} options={radarOptions}></Radar>
          </div> */}
          <div className="member-info-container">
            <div className="member-faculty">
              <Image
                src={`/faculty-icons/${memberRecords[0].faculty_icon_link}`}
                width={25}
                height={25}
                alt="faculty icon"
              />
              <h3>{memberRecords[0].faculty_full_name}</h3>
            </div>
            {WCAId && (
              <div className="member-wca-id">
                <Image src="/wca.svg" width={25} height={25} alt="" />
                <a
                  href={`https://www.worldcubeassociation.org/persons/${WCAId}`}
                >
                  <h3>{WCAId} 🔗</h3>
                </a>
              </div>
            )}
          </div>

          <div className="table-wrapper">
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
                {memberRecords
                  .sort((a, b) => a.cube_order - b.cube_order)
                  .map((result) => (
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
                          <span className="other-rank">
                            {result.single_rank}
                          </span>
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
                          <span className="gold">{result.avg_rank}</span>
                        ) : result.avg_rank === 2 ? (
                          <span className="silver">{result.avg_rank}</span>
                        ) : result.avg_rank === 3 ? (
                          <span className="bronze">{result.avg_rank}</span>
                        ) : (
                          <span className="other-rank">{result.avg_rank}</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

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
            <div className="table-wrapper">
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
