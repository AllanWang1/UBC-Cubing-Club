"use client";

import { useState } from "react";
import { supabase } from "../../lib/SupabaseClient"
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./SignUp.css";

const SignUp = () => {
  const [name, setName] = useState<string>("UBC Cuber");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="sign-up">
      <div className="back">
        <Link href="/signin">
          <p>📝 Back to Sign In</p>
        </Link>
      </div>
      <h2>Sign Up</h2>
      {error && <p>Sign Up Error</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="name"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
