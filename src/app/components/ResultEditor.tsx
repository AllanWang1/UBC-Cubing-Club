"use client";

import { useEffect, useState } from "react";
import { Result } from "@/app/types/Result";
import { formatTime } from "@/app/lib/utils";

interface ResultEditorProps {
    result: Result;
    onClose: () => void;
    onSave: (updatedResult: Result) => Promise<void>;
    onDelete: (result: Result) => Promise<void>;
}

export default function ResultEditor({ result, onClose, onSave, onDelete }: ResultEditorProps) {
    const [rawTime, setRawTime] = useState(result.raw_time_ms);
    const [penalty, setPenalty] = useState(result.penalty);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

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

    const handleSave = async () => {
        const updatedResult: Result = {
            ...result,
            raw_time_ms: rawTime,
            penalty: penalty === "OK" ? null : penalty,
            time_ms: calculateFinalTime(),
        };

        try{
            setSaving(true);
            setSaveError(null);
            await onSave(updatedResult);
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Failed to save pending result.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(`Delete attempt ${result.attempt} for ${result.cube_name} in round ${result.round}?` + "The member will be allowed to attempt this solve again.");
        if (!confirmed) {
           return;
        }

        try {
            setDeleting(true);
            setSaveError(null);
            await onDelete(result);
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Failed to delete pending result.");
        } finally {
            setDeleting(false);
        }
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
                    {saveError && <p className="result-editor-error" role="alert"> {saveError}</p>}
                    <button type="button" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={handleDelete} disabled={saving || deleting}>
                        {deleting ? "Deleting..." : "Delete entry"}
                    </button>
                </div>
            </div>
        </div>
    );
}