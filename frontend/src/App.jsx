import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
const supabase = createClient(
  "https://aprxkjdevkzpsbjumkmm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcnhramRldmt6cHNianVta21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNTU0MjcsImV4cCI6MjA1NDkzMTQyN30.RDvcvsMhJCxKdynvD9SS3oFvSxp9E1Y0Ok2E6Rnpe1g"
);

function App() {
  // const [members, setMembers] = useState([]);

  // useEffect(() => {
  //   getMembers();
  // }, []);

  // async function getMembers() {
  //   const { data, error } = await supabase.from("members").select();

  //   if (error) {
  //     console.error("Error fetching members:", error.message);
  //     return;
  //   }

  //   setMembers(data || []);
  // }

  // return (
  //   <div className="head">
  //     <img src={ cubingLogo } alt="" />
  //     <ul>
  //     {members.map((member) => (
  //       <li key={member.id}>{member.name}</li>
  //     ))}
  //   </ul>
  //   </div>
  // );
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="" element={<Home />}></Route>
        <Route path="/leaderboard" element={<Home />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
