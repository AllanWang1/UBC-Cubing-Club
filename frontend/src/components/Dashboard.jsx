import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient";
import { useNavigate, Link } from "react-router-dom";

import "../styles/dashboard.css"

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out!");
    navigate("/");
    reloadPage();
  };

  return (
    <div className="dashboard">
      {user ? (
        <div className="dashboard-signed-in">
          <h2>Welcome, {user.email}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <Link to='/signin'>
            <p>Sign In</p>
        </Link>
      )}
    </div>
  );
};

export default Dashboard;
