"use client";

import React from "react";
import Image from "next/image";
import "../styles/Home.css";
import { useEffect, useState } from "react";

const Home = () => {
  const [clubInfo, setClubInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/club-info/basic-info");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        // We used .single()
        setClubInfo(data);
      } catch (error) {
        console.error("Error fetching club info:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home">
      {clubInfo && (
        <div className="club-info">
          <div className="intro">
            <Image
              src="/ubc-cubing-logo.png"
              width={200}
              height={200}
              alt="UBC Cubing Logo"
            />
            <h2>UBC Cubing Club</h2>
          </div>
          <div className="info-container">
            <div className="info">
              <Image
                src="/location-icon.svg"
                width={35}
                height={35}
                alt="Location: "
              />
              <p>TBD for Fall 2026</p>
            </div>
            <div className="info">
              <Image src="/time-icon.svg" width={35} height={35} alt="Time: " />
              <p>Thursdays @ 17:00 - 19:00</p>
            </div>
            <div className="info">
              <Image
                src="/instagram-icon.svg"
                width={35}
                height={35}
                alt="Instagram: "
              />
              <a href="https://www.instagram.com/ubccubing/" target="_blank">
                @ubccubing
              </a>
            </div>
            <div className="info">
              <Image
                src="/discord-icon.svg"
                width={35}
                height={35}
                alt="Discord: "
              />
              <a href="https://discord.gg/BErAkAF5qE" target="_blank">
                Join our Discord!
              </a>
            </div>
            <div className="info">
              <Image
                src="/email-icon.svg"
                width={35}
                height={35}
                alt="Email: "
              />
              <p>ubc.speedcubing@gmail.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
