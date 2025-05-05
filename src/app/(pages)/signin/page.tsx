"use client";

import { useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./SignIn.css";

type SignInData = {
  email: string;
  password: string;
}

const SignIn = () => {
  const [formData, setFormData] = useState<SignInData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
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
    <div className="sign-in">
      <div className="back-home">
        <Link href="/">
          <p>🏠 Back to Home</p>
        </Link>
      </div>
      <h2>Sign In</h2>
      {error && <p>Login Error</p>}
      <form onSubmit={handleLogin}>
        <div className="sign-in-input-fields">
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
          <button type="submit">Sign In</button>
        </div>
      </form>
      <Link href="/signup">
        <p>Don&apos;t have an account yet? Sign up!</p>
      </Link>
    </div>
  );
};

export default SignIn;
