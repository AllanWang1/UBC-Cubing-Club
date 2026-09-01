"use client";

import {useEffect, useState} from "react";
import Link from "next/link";

export default function HomeContentPage() {
    const [form, setForm] = useState({
        location: "",
        time: "",
        instagram_name: "",
        discord_link: "",
        email: "",
        linktree_link: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveChange = async (event: React.FormEvent) => {
        event.preventDefault();

        const response = await fetch(
            "/api/admin/club-info/basic-info",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            }
        );

        const data = await response.json();

        if(!response.ok) {
            setMessage(data.error ?? "Failed to update homepage");
            return;
        }

        setMessage("Homepage updated successfully.");
    }

    useEffect(() => {
        async function loadInfo() {
            const response = await fetch("/api/club-info/basic-info");
            const data = await response.json();

            setForm({
                location: data.location ?? "",
                time: data.time ?? "",
                instagram_name: data.instagram_name ?? "",
                discord_link: data.discord_link ?? "",
                email: data.email ?? "",
                linktree_link: data.linktree_link ?? "",
            });
        }

        loadInfo();
    }, []);

    return (
        <section className="admin-content-editor">
            <Link href="/admin"> Back to Admin Dashboard</Link>

            <h1>Edit Homepage Information</h1>

            <form onSubmit={handleSaveChange}>
                <label>
                    Location
                    <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        maxLength={150}
                    />
                </label>

                <label>
                    Meeting time
                    <input
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        maxLength={150}
                    />
                </label>

                <label>
                    Instagram username
                    <input
                    name="instagram_name"
                    value={form.instagram_name}
                    onChange={handleChange}
                    required
                    maxLength={30}
                    />
                </label>

                <label>
                    Discord link
                    <input
                    type="url"
                    name="discord_link"
                    value={form.discord_link}
                    onChange={handleChange}
                    required
                    />
                </label>

                <label>
                    Email
                    <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    />
                </label>

                <label>
                    Linktree link
                    <input
                    type="url"
                    name="linktree_link"
                    value={form.linktree_link}
                    onChange={handleChange}
                    required
                    />
                </label>

                <div className="admin-form-actions">
                    <button type="submit">Save changes</button>
                    <Link href="/admin">Cancel</Link>
                </div>

                {message && <p role="status">{message}</p>}
            </form>
            </section>        
    );
} 