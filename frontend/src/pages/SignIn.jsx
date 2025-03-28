import { useState } from "react";
import { supabase } from "../SupabaseClient";
import { useNavigate, Link } from "react-router-dom";
import "../styles/SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // set handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  };
  return (
    <div className="sign-in">
      <div className="back-home">
        <Link to="/">
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
      <Link to="/signup">
        <p>Don't have an account yet? Sign up!</p>
      </Link>
    </div>
  );
};

export default SignIn;
