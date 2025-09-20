import React from "react";
import Image from "next/image";
import "../styles/Home.css";


const Home = () => {
  return (
    <div className="home">
      <div className="intro">
        <Image src="/ubc-cubing-logo.png" width={200} height={200} alt="UBC Cubing Logo"/>
        <h2>UBC Cubing Club</h2>
      </div>
      <div className="info-container">
        <div className="info">
          <Image src="/location-icon.svg" width={35} height={35} alt="Location: "/>
          <p>IBLC 185, 1961 East Mall, Vancouver, BC V6T 1Z1</p>
        </div>
        <div className="info">
          <Image src="/time-icon.svg" width={35} height={35} alt="Time: "/>
          <p>Thursdays @ 18:00 - 20:00</p>
        </div>
        <div className="info">
          <Image src="/instagram-icon.svg" width={35} height={35} alt="Instagram: "/>
          <a href="https://www.instagram.com/ubccubing/" target="_blank">@ubccubing</a>
        </div>
        <div className="info">
          <Image src="/discord-icon.svg" width={35} height={35} alt="Discord: "/>
          <a href="https://discord.gg/BErAkAF5qE" target="_blank">Join our Discord!</a>
        </div>
        <div className="info">
          <Image src="/email-icon.svg" width={35} height={35} alt="Email: "/>
          <p>ubc.speedcubing@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Home;