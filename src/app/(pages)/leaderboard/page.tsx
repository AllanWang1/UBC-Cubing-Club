"use client"

import { useEffect, useState } from 'react'
interface Result {
  id: number;
  name: string;
  time_ms: number;
  meeting_name: string;
  cube_name: string;
  icon_link: string;
}

const Leaderboard = () => {
  const [singleResults, setSingleResults] = useState<Result[]>([]);
  
  useEffect(() => {
    const fetchSingleResults = async () => {
      const response = await fetch('/api/results/leaderboard-single');
      const res_json = await response.json();
      if (response.ok) {
        setSingleResults(res_json);
      } else {
        console.error("Error fetching results: ", res_json.error);
      }
    }

    fetchSingleResults();
  }, []);

  return (
    <div className="leaderboard">
      <div className="single-leaderboard">
        <h2>Single Results</h2>
      </div>
    </div>
  )
}

export default Leaderboard
