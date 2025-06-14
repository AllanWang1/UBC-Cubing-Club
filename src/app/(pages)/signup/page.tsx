"use client";

import { useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./SignUp.css";

type SignUpData = {
  name: string;
  email: string;
  password: string;
};

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name },
        },
      }
    );
    if (signUpError) {
      setError(signUpError.message);
    } else {
      const user = signUpData.user;
      if (!user) {
        setError("User creation failed");
        return;
      }
      // Insert the new user into the Members table
      const { error } = await supabase.from("Members").insert({
        name: formData.name,
        email: formData.email,
      });
      if (error) {
        setError(error.message);
        return;
      } else {
        alert(
          "Sign up successful, you will receive a confirmation email shortly."
        );
      }
      router.push("/signin");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="sign-up">
      <div className="back">
        <Link href="/signin">
          <p>📝 Back to Sign In</p>
        </Link>
      </div>
      <h2>Sign Up</h2>
      {error && <p>Sign Up Error: {error}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="name"
          placeholder="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
