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
  confirmPassword: string;
};

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name, profilePicURL: "default1.png" },
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
      else if (!(user.identities) || !(user.identities.length > 0)){
        setError("Email is already taken");
        return;
      } 
      else {
        alert(
          "Sign up successful, you will receive a verification email shortly."
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
      {error && <span className="error">Sign Up Error: {error}</span>}
      <form onSubmit={handleSignUp}>
        <input
          type="name"
          placeholder="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
