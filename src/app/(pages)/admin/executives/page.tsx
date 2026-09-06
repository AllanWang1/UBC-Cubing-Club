"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/SupabaseClient";
import { Executive } from "@/app/types/Executive";
import Image from "next/image";
import "./executives.css";

export default function ExecutivesPage() {
    const [executives, setExecutives] = useState<Executive[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExecutives = async () => {
            try {
                const response = await fetch("/api/admin/club-info/executives");

                if (!response.ok) {
                    throw new Error("Failed to fetch executives");
                }
                const data = await response.json();
                setExecutives(data.executives);
            }   catch (err) {
                setError("Failed to fetch executives");
            } finally {
                setLoading(false);
            }
        }

        fetchExecutives();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <section className="admin-executives">
             <Link href="/admin" className="admin-back">
                <Image
                    src="/back.svg"
                    width={16}
                    height={16}
                    alt="back button"
                />
                <p>Back to Admin Dashboard</p>
            </Link>


            <div className="executive-grid">
                {executives.map((executive) => {
                     const { data } = supabase.storage.from("executive-avatars").getPublicUrl(executive.avatar_path);

                     return (
                            <article key={executive.id} className="executive-card">
                                <h2>{executive.name}</h2>

                                <Image
                                    src={data.publicUrl}
                                    width={150}
                                    height={150}
                                    alt={`${executive.name}'s avatar`}
                                    className="executive-avatar"
                                />

                                <Link href={`/admin/executives/${executive.id}`} className="admin-edit">
                                    Edit Executive
                                </Link>
                            </article>
                        );
                })}
            </div>
        </section>
    );
}