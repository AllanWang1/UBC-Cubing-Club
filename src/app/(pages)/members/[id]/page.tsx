"use client";

import React from "react";
import { useState, useEffect } from "react";
import { getPublicURLWithPath, formatTime } from "@/app/lib/utils";
import Image from "next/image";

interface MemberSingleResult {
  id: number;
  name: string;
  cube_name: string;
  icon_link: string;
  single_time_ms: number;
  single_rank: number;
  avg_time_ms: number;
  avg_rank: number;
}

const Member = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const [singleResults, setSingleResults] = useState<MemberSingleResult[]>([]);

  useEffect(() => {
    const fetchMember = async () => {
      const response = await fetch(`/api/members/${id}`);
      const res_json = await response.json();
      if (response.ok) {
        setSingleResults(res_json);
      }
    };

    fetchMember();
  }, []);

  return (
    <div className="Member">
      {singleResults.length > 0 ? (
        <div className="Header">
          <h2>{singleResults[0].name}</h2>
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
              {singleResults.map((result) => (
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
                    <p>{result.single_rank}</p>
                  </td>
                  <td>
                    <p>{formatTime(result.single_time_ms)}</p>
                  </td>
                  <td>
                    {result.avg_time_ms && <p>{formatTime(result.avg_time_ms)}</p>}
                  </td>
                  <td>
                    {result.avg_rank && <p>{result.avg_rank}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <h2>Loading...</h2>
      )}
    </div>
  );
};

export default Member;
