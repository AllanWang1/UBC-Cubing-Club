"use client";

import { useEffect, useState } from "react";
import { Result } from "@/app/types/Result";
import { formatTime } from "@/app/lib/utils";

interface ResultEditorProps {
    result: Result;
    onClose: () => void;
    onSave: (updatedResult: Result) => void;
}

export default function ResultEditor({ result, onClose, onSave }: ResultEditorProps) {
    const [rawTime, setRawTime] = useState(result.raw_time_ms);
    const [penalty, setPenalty] = useState(result.penalty);

    useEffect(() => {
        setRawTime(result.raw_time_ms);
        setPenalty(result.penalty ?? "OK");
    }, [result]);

    const calculateFinalTime = () => {
        if (penalty === "DNF") {
            return 99999999;
        }

        if (penalty === "+2") {
            return rawTime + 2000;
        }

        if (penalty === "+4") {
            return rawTime + 4000;
        }

        if (penalty === "+6") {
            return rawTime + 6000;
        }
        
        return rawTime;
    };

    const handleSave = () => {
        const updatedResult: Result = {
            ...result,
            raw_time_ms: rawTime,
            penalty: penalty === "OK" ? null : penalty,
            time_ms: calculateFinalTime(),
        };
        onSave(updatedResult);
    };

    return (
        <div className="result-editor-overlay">
            <div className="result-editor">
                <h2>Edit Pending Result</h2>

                <p>Member ID: {result.id}</p>
                <p>Event: {result.cube_name}</p>
                <p>Round: {result.round}</p>
                <p>Attempt: {result.attempt}</p>

                <label>
                    Raw Time (ms):
                    <input
                        type="number"
                        min="0"
                        value={rawTime}
                        disabled={penalty === "DNF"}
                        onChange={(e) => setRawTime(Number(e.target.value))}
                    />
                </label>

                <label>
                    Penalty
                    <select value={penalty ?? "OK"} onChange={(e) => setPenalty(e.target.value)}>
                        <option value="OK">OK</option>
                        <option value="+2">+2</option>
                        <option value="+4">+4</option>
                        <option value="+6">+6</option>
                        <option value="DNF">DNF</option>
                    </select>
                </label>

                <p>Final Time: {formatTime(calculateFinalTime())}</p>

                <div className="result-editor-actions">
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}