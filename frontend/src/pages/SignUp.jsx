import { useState } from "react";
import { supabase } from "../SupabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/SignUp.css";

const SignUp = () => {
  const [name, setName] = useState("UBC Cuber");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    if (error) {
        setError(error);
    } else {
        navigate("/signin")
    }
  };

  return (
    <div className="sign-up">
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
