"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PasswordResetSubmissionProps {
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetSubmission = () => {
  const router = useRouter();

  const [passwordReset, setPasswordReset] =
    useState<PasswordResetSubmissionProps>({
      newPassword: "",
      confirmPassword: "",
    });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof PasswordResetSubmissionProps,
    value: string,
  ) => {
    setPasswordReset((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { newPassword, confirmPassword } = passwordReset;
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/members/passwords/reset", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newPassword }),
    });

    const res_json = await response.json();
    if (!response.ok) {
      setError(`Error: ${res_json.error}`);
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);

    alert("Password reset successfully!");
    router.push("/signin");
  };

  return (
    <div className="password-reset-submission">
      <h2>Set your new password</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            value={passwordReset.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            value={passwordReset.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting password..." : "Reset password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordResetSubmission;
