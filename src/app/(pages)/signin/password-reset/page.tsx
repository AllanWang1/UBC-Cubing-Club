"use client";

import { useState } from "react";
import Link from "next/link";

import "./PasswordReset.css";
const PasswordReset = () => {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/members/passwords/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const res_json = await response.json();
    if (!response.ok) {
      alert(`Error: ${res_json.error}`);
      return;
    }
    alert("Password reset email sent successfully!");

  };
  return (
    <div className="password-reset">
      <div className="back-home">
        <Link href="/">
          <p>🏠 Back to Home</p>
        </Link>
      </div>
      <h2>Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Password Reset Email</button>
      </form>
    </div>
  );
};

export default PasswordReset;
