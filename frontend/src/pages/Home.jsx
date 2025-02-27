import React from "react";
import "../styles/Home.css";
import Navbar from "../components/Navbar";

import emailIcon from "../assets/email-icon.svg";
import locationIcon from "../assets/location-icon.svg";
import timeIcon from "../assets/time-icon.svg";
import instagramIcon from "../assets/instagram-icon.svg";
import discordIcon from "../assets/discord-icon.svg";
import cubingLogo from "/ubc-cubing-logo.png";

const Home = () => {
  return (
    <div className="home">
      <div className="intro">
        <img src={cubingLogo} alt="" />
        <h2>UBC Cubing Club</h2>
      </div>
      <div className="info-container">
        <div className="info">
          <img src={locationIcon} alt="" />
          <p>IBLC 156, 1961 East Mall, Vancouver, BC V6T 1Z1</p>
        </div>
        <div className="info">
          <img src={timeIcon} alt="" />
          <p>Thursdays @ 17:30 - 19:30</p>
        </div>
        <div className="info">
          <img src={instagramIcon} alt="" />
          <a href="https://www.instagram.com/ubccubing/" target="_blank">@ubccubing</a>
        </div>
        <div className="info">
          <img src={discordIcon} alt="" />
          <a href="https://discord.gg/BErAkAF5qE" target="_blank">Join our Discord!</a>
        </div>
        <div className="info">
          <img src={emailIcon} alt="" />
          <p>ubc.speedcubing@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
