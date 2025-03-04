import React from "react";
import { supabase } from "../SupabaseClient";

const LogoutButton = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out!");
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
