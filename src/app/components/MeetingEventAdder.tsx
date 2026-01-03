"use client";

import { SUPPORTED_CUBES } from "../lib/utils";
import { useState, useEffect } from "react";
import { Hold } from "../types/Hold";

const MeetingEventAdder = () => {
  const [hold, setHold] = useState<Hold>({
    meeting_id: 1,
    cube_name: "3x3",
    format: "AO5",
    rounds: 1,
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setHold((prevHold) => ({
      ...prevHold,
      [name]: value,
    }));
  }

  return (
    <div className="meeting-event-adder">
      <form>
        <h3>Add Event to Meeting</h3>
        <p>Note: please be mindful to keep the events and rounds appropriate, thanks!</p>
        <label>Cube Name:</label>
        <select name="cube_name" onChange={handleChange}>
          {SUPPORTED_CUBES.map((cube) => (
            <option key={cube} value={cube}>
              {cube}
            </option>
          ))}
        </select>
        <label>Format:</label>
        <select name="format" onChange={handleChange}>
          <option value="AO5">AO5</option>
          <option value="MO3">MO3</option>
          <option value="BO3">BO3</option>
          <option value="BO1">BO1</option>
        </select>
        <label>Rounds:</label>
        <input
          type="number"
          name="rounds"
          min={1}
          max={3}
          value={hold.rounds}
          onChange={handleChange}
        />
      </form>
    </div>
  );
};

export default MeetingEventAdder;
