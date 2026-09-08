"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ExecutiveDetails = {
    id: number;
    name: string;
    quote: string;
    avatar_path: string;
    positions: {
        title: string;
        start_date: string;
        end_date: string | null;
    }[];
};

type ExecutiveDetailsPageProps = {
    params: Promise<{ id: string }>;
};

export default function ExecutiveDetailsPage({ params }: ExecutiveDetailsPageProps) {
    const { id } = use(params);
    const [executive, setExecutive] = useState<ExecutiveDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    /*const [imageFile, setImageFile] = useState<File | null>(null);*/
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const updateExecutiveDetails = (
        index: number,
        field: "title" | "start_date" | "end_date",
        value: string
    ) => {
        setExecutive((current) => {
            if (!current) return current;

            const updatedPositions = current.positions.map((position, positionIndex) => {
                if (positionIndex !== index) return position;

                return {
                    ...position,
                    [field]: field === "end_date" && value === "" ? null : value,
                };
            }        
        );
            return { ...current, positions: updatedPositions };
        });
    };

    const handleSaveChange = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!executive) {
            setError("No executive data to save");
            return;
        }

        setSaving(true);
        setMessage(null);
        
        try {
            const response = await fetch(`/api/admin/club-info/executives/${executive.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: executive.name,
                    quote: executive.quote,
                    positions: executive.positions,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save executive details");
            }

            
            setExecutive((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    name: data.executive.name,
                    quote: data.executive.quote,
                };
            });

            setMessage("Changes saved successfully!");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to save executive details");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const fetchExecutiveDetails = async () => {
            try {
                const response = await fetch(`/api/admin/club-info/executives/${id}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch executive details");
                }
                const data = await response.json();
                setExecutive(data.executive);
            } catch (err) {
                setError("Failed to fetch executive details");
            } finally {
                setLoading(false);
            }
        };

        fetchExecutiveDetails();
    }, [id]);

    if (loading) {
        return <p>Loading...</p>;
    }
    
    if (error) {
        return <p>{error}</p>;
    }

    if (!executive) {
        return <p>Executive not found</p>;
    }
    
    return (
        <section className="executive-details">
            <Link href="/admin/executives" className="admin-back">
                <Image
                    src="/back.svg"
                    width={16}
                    height={16}
                    alt="back button"
                />
                <p>Back to Executives</p>
            </Link>
            
            <form className="executive-form" onSubmit={handleSaveChange}>
                <div className="form-fields">
                    <label htmlFor="executive-name">Name</label>
                    <input
                        id="executive-name"
                        type="text"
                        value={executive.name}
                        onChange={(e) => setExecutive({ ...executive, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-fields">
                    <label htmlFor="executive-quote">Quote</label>
                    <textarea
                        id="executive-quote"
                        value={executive.quote}
                        onChange={(e) => setExecutive({ ...executive, quote: e.target.value })}
                        rows={5}
                    />
                </div>

                 <div className="form-field">
                    <label htmlFor="executive-avatar">Avatar</label>
                    <input
                        id="executive-avatar"
                        type="file"
                        accept="image/*"
                        /*onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}*/
                    />
                </div>

                <fieldset className="executive-positions">
                    {executive.positions.map((position, index) => (
                        <div key={`position-${index}`} className="position-entry">
                            <div className="form-field">
                                <label htmlFor={`position-title-${index}`}>Title</label>
                                <input
                                    id={`position-title-${index}`}
                                    type="text"
                                    value={position.title}
                                    onChange={(e) =>
                                        updateExecutiveDetails(index, "title", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor={`position-start-date-${index}`}>Start Date</label>
                                <input
                                    id={`position-start-date-${index}`}
                                    type="date"
                                    value={position.start_date}
                                    onChange={(e) =>
                                        updateExecutiveDetails(index, "start_date", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor={`position-end-date-${index}`}>End Date</label>
                                <input
                                    id={`position-end-date-${index}`}
                                    type="date"
                                    value={position.end_date || ""}
                                    onChange={(e) =>
                                        updateExecutiveDetails(index, "end_date", e.target.value)
                                    }
                                />
                                <small>Leave empty if this is the current position.</small>
                            </div>
                        </div>
                    ))}
                </fieldset>

                {message && <p className="form-message">{message}</p>}

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </section>
    );
}