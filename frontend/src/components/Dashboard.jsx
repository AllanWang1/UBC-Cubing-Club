import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient";
import { useNavigate, Link } from "react-router-dom";

import "../styles/Dashboard.css";

const Dashboard = () => {
  const getPublicURL = (path) => {
    if (!path) return null;
    const { data } = supabase.storage
      .from("ProfilePictures")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const [user, setUser] = useState(null);
  const [avatarURL, setAvatarURL] = useState(getPublicURL("default1.png"));
  const [isOpen, setIsOpen] = useState(false);

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
      if (user.user_metadata?.profilePicURL) {
        setAvatarURL(user.user_metadata.profilePicURL);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out!");
    navigate("/");
    reloadPage();
  };

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dashboard">
      {user ? (
        <div className="dashboard-profile">
          {user.user_metadata.full_name ? (
            <h2>{user.user_metadata.full_name}</h2>
          ) : (
            <h2>{user.email}</h2>
          )}
          <div className="dashboard-profile-menu">
            <img src={avatarURL} alt="Profile Picture" onClick={toggleIsOpen} />
            {isOpen && (
              <div className="dashboard-drop-down-menu">
                <ul>
                  <li>Profile Page</li>
                  <li>Edit Profile</li>
                  <li><button onClick={handleLogout}>Log Out</button></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link to="/signin">
          <p>Sign In</p>
        </Link>
      )}
    </div>
  );
};

export default Dashboard;
