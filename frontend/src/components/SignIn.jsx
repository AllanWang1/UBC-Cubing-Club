import { useState } from "react";
import { supabase } from "../SupabaseClient";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // set handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
  };
  return (
    <div className="sign-in">
        <h2>Sign In</h2>
        {error && <p>Login Error</p>}
        <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Sign In</button>
        </form>
    </div>
  );
};

export default SignIn;
