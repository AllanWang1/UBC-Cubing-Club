"use client";

import React from "react";
import "./About.css";
import Image from "next/image";
import { Executive } from "@/app/types/Executive";
import { useState, useEffect } from "react";
import { getPublicURLWithPath } from "@/app/lib/utils";

const About = () => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const response = await fetch("/api/club-info/executives");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setExecutives(data);
      } catch (error) {
        console.error("Error fetching executives:", error);
      }
    };

    fetchExecutives();
  }, []);
  return (
    <div className="aboutus">
      <div className="about-intro">
        <Image
          src="/club.png"
          alt="Club"
          width={800}
          height={400}
          className="club-image"
        />
        <div className="about-intro-overlay">
          <h2>
            <strong>Welcome to the UBC Cubing Club!</strong>
          </h2>
        </div>
      </div>

      <div className="container">
        <div className="section">
          <div className="mission">
            <h2>Our Mission</h2>
          </div>

          <div className="mission-section">
            <Image
              src="/mission.png"
              alt="Mission"
              width={550}
              height={300}
              className="mission-image"
            />
            <div className="mission-text">
              <p>
                At the UBC Cubing Club, our mission is to{" "}
                <strong>promote the exciting world of speedcubing</strong>{" "}
                within the University of British Columbia and the broader
                Vancouver community. We are passionate about{" "}
                <strong>fostering a welcoming and inclusive environment</strong>{" "}
                where cubers of all skill levels — from beginners to national
                competitors — can connect, learn, and grow. We actively work to:
              </p>

              <ul>
                <li>
                  <strong>
                    Increase awareness and interest in speedcubing
                  </strong>{" "}
                  through demos, and casual meetups on campus
                </li>
                <li>
                  <strong>
                    Host official World Cube Association (WCA) competitions
                  </strong>{" "}
                  right here at UBC, giving local cubers a chance to compete,
                  achieve personal bests, and gain official rankings
                </li>
                <li>
                  <strong>Organize interclub competitions</strong> to build
                  community across schools and organizations, encouraging
                  friendly rivalry and collaboration
                </li>
              </ul>

              <p>
                Whether you&apos;re solving your first cube or chasing sub-4
                averages, the UBC Cubing Club is your hub for sharpening skills,
                making friends, and sharing the joy of cubing.
              </p>
            </div>
          </div>
        </div>

        <div className="team-section">
          <h2>Meet the Team</h2>

          <div className="team">
            {executives.map((executive) => (
              <div className="team-member" key={executive.id}>
                <Image
                  src={getPublicURLWithPath(
                    "executive-avatars",
                    executive.avatar_path,
                  )}
                  alt={executive.name}
                  width={200}
                  height={200}
                  className="member-image"
                />

                <h3>{executive.name}</h3>

                <div className="about-team-section-positions">
                  {executive.positions.map((position, i) => (
                    <div className="about-team-section-position" key={i}>
                      <h5>{position.title}</h5>

                      <p>
                        {new Date(position.start_date).getFullYear()}
                        {" - "}
                        {position.end_date
                          ? new Date(position.end_date).getFullYear()
                          : "Present"}
                      </p>
                    </div>
                  ))}
                </div>

                {executive.quote && (
                  <p className="about-team-section-quote">{executive.quote}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="about-resources">
          <h2>Additional Resources</h2>
          <p className="resources-subtitle">
            Helpful websites for learning, practicing, and staying involved in
            the cubing community.
          </p>

          <div className="resource-list">
            <a
              className="resource-card"
              href="https://www.worldcubeassociation.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="resource-image-container">
                <Image
                  src="/resource-previews/wca.webp"
                  alt="World Cube Association"
                  width={320}
                  height={200}
                  className="resource-image"
                />
              </div>

              <div className="resource-body">
                <h3>World Cube Association</h3>

                <p>
                  The official organization for competitive speedcubing. Browse
                  competitions, rankings, regulations, and competitor profiles
                  from around the world.
                </p>

                <span className="resource-link">Visit Website →</span>
              </div>
            </a>
            <a
              className="resource-card"
              href="https://3stylealgs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="resource-image-container">
                <Image
                  src="/resource-previews/three_style_visualizer.webp"
                  alt="3 style algorithm visualizer"
                  width={320}
                  height={200}
                  className="resource-image"
                />
              </div>

              <div className="resource-body">
                <h3>3 Style Algorithm Visualizer</h3>

                <p>
                  Made by our very own UBC Cubing Club member, Etan Huang. This
                  tool allows you to visualize and learn 3-style algorithms for
                  3x3 BLD.
                </p>

                <span className="resource-link">Visit Website →</span>
              </div>
            </a>
            <a
              className="resource-card"
              href="https://jperm.net/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="resource-image-container">
                <Image
                  src="/resource-previews/jperm.webp"
                  alt="JPerm.net"
                  width={320}
                  height={200}
                  className="resource-image"
                />
              </div>

              <div className="resource-body">
                <h3>JPerm.net</h3>

                <p>
                  Proudly by our UBC Alumni and the GOATed YouCuber, JPerm. One
                  of the best places to learn CFOP, improve your solving, and
                  explore advanced algorithms through detailed tutorials.
                </p>

                <span className="resource-link">Visit Website →</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
