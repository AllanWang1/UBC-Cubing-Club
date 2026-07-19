"use client"

import React, { useEffect, useMemo, useState }from "react";
import Link from "next/link";
import { ADMIN_ROLES, formatTime, getUserRole } from "@/app/lib/utils";
import { Result } from "@/app/types/Result";

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

                const response = await fetch(`/api/pending/all-pending?meeting_id=${id}`);
                
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
        <main>
            <Link href={`/meetings/${id}`}> Back to meeting</Link>
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


            </div>

            {!loadingResults && !error && filteredResults.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Member ID</th>
                            <th>Event</th>
                            <th>Round</th>
                            <th>Attempt</th>
                            <th>Raw Time</th>
                            <th>Penalty</th>
                            <th>Final Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredResults.map((result) => (
                            <tr key={`${result.id}-${result.cube_name}-${result.round}-${result.attempt}`}>
                                <td>{result.Members.name}</td>
                                <td>{result.id}</td>
                                <td>{result.cube_name}</td>
                                <td>{result.round}</td>
                                <td>{result.attempt}</td>
                                <td>{formatTime(result.raw_time_ms)}</td>
                                <td>{result.penalty ?? "OK"}</td>
                                <td>{formatTime(result.time_ms)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!loadingResults && !error && pendingResults.length === 0 && (
                <p>There are no pending results to validate for this meeting.</p>
            )}

            {!loadingResults && !error && filteredResults.length === 0 && pendingResults.length > 0 && (
                <p>No results match the current filters.</p>
            )}
        </main>
    );
    
}