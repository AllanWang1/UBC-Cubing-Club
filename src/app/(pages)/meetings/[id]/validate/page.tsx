"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ADMIN_ROLES, formatTime, getUserRole } from "@/app/lib/utils";
import { Result } from "@/app/types/Result";
import ResultEditor from "@/app/components/ResultEditor";
import "./validateResults.css";
import Image from "next/image";

interface PendingResultWithMember extends Result {
    Members: {
        id: number;
        name: string;
    };
}

export default function ValidateResultsPage ({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);

    // Permission state
    const [checkPermission, setCheckPermission] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Pending results state
    const [pendingResults, setPendingResults] = useState<PendingResultWithMember[]>([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters state
    const [memberIdFilter, setMemberIdFilter] = useState<string>("");
    const [cubeNameFilter, setCubeNameFilter] = useState<string>("");

    const [approving, setApproving] = useState(false);
    const [approvalError, setApprovalError] = useState<string | null>(null);

    const cubeNameOptions = useMemo(() => {
        const uniqueCubeNames = Array.from(new Set(pendingResults.map(result => result.cube_name)));
        return uniqueCubeNames.sort();
    }, [pendingResults]);

    const filteredResults = useMemo(() => {
        return pendingResults.filter(result => {
            const matchesMemberId = memberIdFilter ? result.Members.id.toString().includes(memberIdFilter.trim()) : true;
            const matchesCubeName = cubeNameFilter ? result.cube_name === cubeNameFilter : true;
            return matchesMemberId && matchesCubeName;
        });
    }, [pendingResults, memberIdFilter, cubeNameFilter]);

    const [editingResult, setEditingResult] = useState<PendingResultWithMember | null>(null);

    const handleSaveResult = async (updatedResult: Result) => {
            setError(null);

            const response = await fetch("/api/admin/pending-results", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    meeting_id: updatedResult.meeting_id,
                    id: updatedResult.id,
                    cube_name: updatedResult.cube_name,
                    round: updatedResult.round,
                    attempt: updatedResult.attempt,
                    raw_time_ms: updatedResult.raw_time_ms,
                    penalty: updatedResult.penalty ?? "OK",
                }),
            });

            const body = await response.json();

            if (!response.ok) {
                throw new Error(body.error ?? "Failed to update pending result");
            }

            setPendingResults((currentResults) =>
                currentResults.map((result) => {
                    const matches =
                        result.meeting_id === body.meeting_id &&
                        result.id === body.id &&
                        result.cube_name === body.cube_name &&
                        result.round === body.round &&
                        result.attempt === body.attempt;

                    return matches
                        ? { ...result, ...body }
                        : result;
                })
            );
            setEditingResult(null);
    };

    const handleDeleteResult = async (resultToDelete: Result) => {
        const response = await fetch("/api/admin/pending-results", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                meeting_id: resultToDelete.meeting_id,
                id: resultToDelete.id,
                cube_name: resultToDelete.cube_name,
                round: resultToDelete.round,
                attempt: resultToDelete.attempt,
            }),
        });

        const body = await response.json();

        if (!response.ok) {
            throw new Error(body.error ?? "Failed to delete pending result");
        }

        setPendingResults((currentResults) =>
            currentResults.filter((result) => {
                const isDeletedResult =
                    result.meeting_id === body.meeting_id &&
                    result.id === body.id &&
                    result.cube_name === body.cube_name &&
                    result.round === body.round &&
                    result.attempt === body.attempt;

                return !isDeletedResult;
            })
        );
        setEditingResult(null);
    };

    const handleApproveResults = async () => {
        const confirmed = window.confirm(`Approve all ${pendingResults.length} pending results for this meeting?`);

        if (!confirmed) {
            return;
        }

        try {
            setApproving(true);
            setApprovalError(null);

            const response = await fetch("/api/admin/pending-results/approve", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ meeting_id: parseInt(id) }),
            });

            const body = await response.json();

            if (!response.ok) {
                throw new Error(body.error ?? "Failed to approve pending results");
            }

            setPendingResults([]);
            window.alert(`${body.approvedCount} pending results approved successfully.`);
        } catch (error) {
            setApprovalError(error instanceof Error ? error.message : "Failed to approve pending results");
        } finally {
            setApproving(false);
        }
    };

    // Check the user's role
    useEffect(() => {
        async function checkPermission() {
        try {
            const role = await getUserRole();
            setIsAdmin(role != null && ADMIN_ROLES.includes(role));
            setCheckPermission(false);
        } catch {
            setIsAdmin(false);
        } finally {
            setCheckPermission(false);
        }
    }

        checkPermission();
    }, []);
    
    // Fetch pending results if the user is an admin
    useEffect(() => {
        if (!isAdmin) {
            return;
        }

        async function fetchPendingResults() {
            try {
                setLoadingResults(true);
                setError(null);

                const response = await fetch(`/api/pending?meeting_id=${id}`);
                
                const body = await response.json();

                if (!response.ok) {
                    throw new Error(body.error || "Failed to fetch pending results");
                }

                setPendingResults(body);
            } catch (err) {
               setError( err instanceof Error ? err.message : "Failed to fetch pending results");
            } finally {
                setLoadingResults(false);
            }
        } 

        fetchPendingResults();
    }, [id, isAdmin]);

    if (checkPermission) {
        return <p>Checking permissions...</p>;
    }

    if (!isAdmin) {
        return (
            <main>
                <h1>Access Denied</h1>
                <p>You do not have permission to view this page.</p>
                <Link href={`/meetings/${id}`}>Back to meeting</Link>
            </main>
        );
    }

    return (
        <main className="validate-results-page">
            <div className="validate-results-back">
                <Image src="/back.svg" width={16} height={16} alt="back button" />
                <Link href={`/meetings/${id}`}>
                    <p>Back to meeting</p>
                </Link>
            </div>
            <h1>Validate Results</h1>

            {loadingResults && <p>Loading pending results...</p>}

            {error && <p>{error}</p>}

            {!loadingResults && !error && pendingResults.length === 0 && (
                <p>There are no pending results to validate for this meeting.</p>
            )}

            <div className="pending-results-filters">
                <label>
                    Member ID
                    <input 
                        type="search"
                        inputMode="numeric"
                        value={memberIdFilter}
                        onChange={(event) => setMemberIdFilter(event.target.value)}
                        placeholder="Filter by Member ID"
                    />
                </label>

                <label>
                    Cube Name
                    <select
                        value={cubeNameFilter}
                        onChange={(event) => setCubeNameFilter(event.target.value)}
                    >
                        <option value="">All Cubes</option>

                        {cubeNameOptions.map((cubeName) => (
                            <option key={cubeName} value={cubeName}>
                                {cubeName}
                            </option>
                        ))}
                    </select>
                </label>

                <button
                    type="button"
                    onClick={handleApproveResults}
                    disabled={approving || pendingResults.length === 0}
                >
                    {approving ? "Approving..." : `Approve All ${pendingResults.length} Results`}
                </button>

                {approvalError && <p role="alert" className="approval-error">{approvalError}</p>}


            </div>

            {!loadingResults && !error && filteredResults.length > 0 && (
                 <div className="pending-results-table-wrapper">
                    <table className="pending-results-table">
                            <thead>
                                <tr>
                                    <th>Member Name</th>
                                    <th>Member ID</th>
                                    <th>Event</th>
                                    <th>Round</th>
                                    <th>Attempt</th>
                                    <th>Raw Time</th>
                                    <th>Penalty</th>
                                    <th>Final Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredResults.map((result) => (
                                    <tr key={`${result.id}-${result.cube_name}-${result.round}-${result.attempt}`}>
                                        <td>{result.Members.name}</td>
                                        <td>{result.Members.id}</td>
                                        <td>{result.cube_name}</td>
                                        <td>{result.round}</td>
                                        <td>{result.attempt}</td>
                                        <td>{formatTime(result.raw_time_ms)}</td>
                                        <td>{result.penalty ?? "OK"}</td>
                                        <td>{formatTime(result.time_ms)}</td>
                                        <td>
                                            <button type="button" onClick={() => setEditingResult(result)}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                    </table>
                </div>
            )}

            {!loadingResults && !error && filteredResults.length === 0 && pendingResults.length > 0 && (
                <p>No results match the current filters.</p>
            )}

            {editingResult && (
                <ResultEditor
                    result={editingResult}
                    onClose={() => setEditingResult(null)}
                    onSave={handleSaveResult}
                    onDelete={handleDeleteResult}
                />
            )}
        </main>
    );
}
