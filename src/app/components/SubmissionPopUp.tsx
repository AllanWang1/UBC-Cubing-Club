"use client";

import { useState } from "react";
import { formatTime } from "../lib/utils";
import { Result } from "../types/Result";
import { DNF } from "../lib/utils";

type PopUpProps = {
  isOpen: boolean;
  // The function for closing
  onClose: () => void;
  result: Result;
};
const SubmissionPopUp = ({ isOpen, onClose, result }: PopUpProps) => {

  const [selected, setSelected] = useState<string>("OK");
  // Do not perform any operations if not opened
  if (!isOpen) return null;

  const handleChoice = (newOption: string) => {
    setSelected(newOption);
  };

  async function submitResult(result: Result) {
    try {
      const response = await fetch(`/api/pending/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });
      const res_json = await response.json();
      if (response.ok) {
        // Close the pop-up on success and alert success
        onClose(); 
        alert("Result successfully submitted for review!");
        return;
      } else {
        throw new Error("Error submitting result: " + res_json.error);
      }
    } catch (err) {
      alert("Error submitting result: " + err);
    }
  }

  const submitOption = async () => {
    const localResult = result;
    switch (selected) {
      case "+2":
        localResult.penalty = "+2";
        // Add 2000ms = 2s to the solve
        localResult.time_ms = localResult.raw_time_ms + 2000;
        break;
      case "DNF":
        localResult.penalty = "DNF";
        localResult.time_ms = DNF;
        break;
      default:
        localResult.penalty = null;
        break;
    }
    await submitResult(localResult);
  };

  return (
    <div className="submission-pop-up">
      <h3>Your Solve: {formatTime(result.raw_time_ms)}</h3>
      <p>Mark as (penalties?):</p>
      <ul className="submission-pop-up-penalty-list">
        <li
          className={`penalty-option${selected == "OK" ? "selected" : ""}`}
          onClick={() => handleChoice("OK")}
        >
          OK
        </li>
        <li
          className={`penalty-option${selected == "+2" ? "selected" : ""}`}
          onClick={() => handleChoice("+2")}
        >
          +2
        </li>
        <li
          className={`penalty-option${selected == "DNF" ? "selected" : ""}`}
          onClick={() => handleChoice("DNF")}
        >
          DNF
        </li>
      </ul>
      <button onClick={() => submitOption()}>Submit</button>
    </div>
  );
};

export default SubmissionPopUp;
