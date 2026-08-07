"use client";

import React from "react";
import Image from "next/image";
import "../styles/Home.css";
import { useEffect, useState } from "react";
import { ClubBasicInformation } from "../types/ClubBasicInformation";

const Home = () => {
  const [clubInfo, setClubInfo] = useState<ClubBasicInformation | null>(null);

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
                src="/homepage-information-icons/location-icon.svg"
                width={35}
                height={35}
                alt="Location: "
              />
              <p>{clubInfo.location}</p>
            </div>
            <div className="info">
              <Image src="/homepage-information-icons/time-icon.svg" width={35} height={35} alt="Time: " />
              <p>{clubInfo.time}</p>
            </div>
            <div className="info">
              <Image
                src="/homepage-information-icons/instagram-icon.svg"
                width={35}
                height={35}
                alt="Instagram: "
              />
              <a
                href={`https://www.instagram.com/${clubInfo.instagram_name}/`}
                target="_blank"
              >
                @{clubInfo.instagram_name}
              </a>
            </div>
            <div className="info">
              <Image
                src="/homepage-information-icons/discord-icon.svg"
                width={35}
                height={35}
                alt="Discord: "
              />
              <a href={clubInfo.discord_link} target="_blank">
                Join our Discord!
              </a>
            </div>
            <div className="info">
              <Image
                src="/homepage-information-icons/email-icon.svg"
                width={35}
                height={35}
                alt="Email: "
              />
              <p>{clubInfo.email}</p>
            </div>
            <div className="info">
              <Image
                src="/homepage-information-icons/linktree-icon.svg"
                width={35}
                height={35}
                alt="Linktree: "
              />
              <a href={clubInfo.linktree_link} target="_blank">
                Linktree
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
