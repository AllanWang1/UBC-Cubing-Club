"use client";

import { SUPPORTED_CUBES } from "../lib/utils";
import { useState } from "react";
import { Hold } from "../types/Hold";
import "../styles/MeetingEventAdder.css";

// This is for signalizing the change in successful event addition.
type MeetingEventAdderProps = {
  onEventAdded: () => void;
};

const MeetingEventAdder = ({ onEventAdded }: MeetingEventAdderProps) => {
  const meetingId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("meetingId") : null;
  const [hold, setHold] = useState<Hold>({
    meeting_id: meetingId ? parseInt(meetingId) : 0,
    cube_name: "3x3",
    format: "AO5",
    rounds: 1,
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/holds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hold),
    });
    const res_json = await response.json();
    if (response.ok) {
      alert(
        `Successfully added event: ${res_json.cube_name} (${res_json.format})`
      );
      // Notify parent about the addition
      onEventAdded();
    } else {
      alert(`Failed to add event: ${res_json.error}`);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setHold((prevHold) => ({
      ...prevHold,
      [name]: value,
    }));
  };

  return (
    <div className="meeting-event-adder">
      <form className="meeting-event-adder-form" onSubmit={handleAddEvent}>
        <h3>Add Event</h3>
        <p>
          Note: please be mindful to keep the events and rounds appropriate,
          thanks!
        </p>
        <label>Cube Name:</label>
        <select name="cube_name" onChange={handleChange} defaultValue={"3x3"}>
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
        <button type="submit">Add Event</button>
      </form>
    </div>
  );
};

export default MeetingEventAdder;
