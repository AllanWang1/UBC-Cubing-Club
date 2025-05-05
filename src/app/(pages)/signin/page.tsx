"use client";

import { useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  // const reloadPage = () => {
  //   window.location.reload();
  // };

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
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
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
