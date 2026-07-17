"use client"

import React, { useEffect, useState }from "react";
import Link from "next/link";
import { ADMIN_ROLES, getUserRole } from "@/app/lib/utils";
import { Result } from "@/app/types/Result";


export default function ValidateResultsPage ({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);

    const [checkPermission, setCheckPermission] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [pendingResults, setPendingResults] = useState<Result[]>([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function checkUserPermission() {
            const role = await getUserRole();
            setIsAdmin(role != null && ADMIN_ROLES.includes(role));
            setCheckPermission(false);
        }

        checkUserPermission();
    }, []);
    
    if (checkPermission) {
        return <p>Checking permissions...</p>;
    }

    if (!isAdmin) {
        return (
            <main>
                <h1>Access Denied</h1>
                <p>You do not have permission to access this page.</p>
                <Link href={`/meetings/${id}`}>Back to meeting</Link>
            </main>
        );
    }

    useEffect(() => {
        async function fetchPendingResults() {
            try {
                setLoadingResults(true);
                setError(null);

                const response = await fetch(`/api/pending/all-pending?meeting_id=${id}`);
    
    return (
        <main>
            <Link href={`/meetings/${id}`}> Back to meeting</Link>
            <h1>Validate Results</h1>
        </main>
    );
}