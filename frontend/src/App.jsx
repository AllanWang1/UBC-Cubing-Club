import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Leaderboard from "./pages/Leaderboard";
import Tournaments from "./pages/Tournaments";
import Feed from "./pages/Feed";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function App() {
  const location = useLocation();
  const hiddenRoutes = ["/signup", "/signin"];
  return (
    <div>
      {!hiddenRoutes.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="" element={<Home />}></Route>
        <Route path="/aboutus" element={<About />}></Route>
        <Route path="/leaderboard" element={<Leaderboard />}></Route>
        <Route path="/tournaments" element={<Tournaments />}></Route>
        <Route path="/feed" element={<Feed />}></Route>
        <Route path="/signin" element={<SignIn />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
      </Routes>
    </div>
  );
}

export default App;
