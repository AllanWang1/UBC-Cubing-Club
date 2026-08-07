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
      <div className="about-banner">
        <Image
          src="/about_background.png"
          alt="Club"
          width={2984}
          height={1000}
          className="club-banner-image"
        />
        <div className="about-club-introduction"></div>
        <div className="banner-overlay">
          <Image
            src="/ubc_logo_white.webp"
            alt="UBC Logo"
            width={250}
            height={250}
            className="club-logo"
          />

          <div className="banner-text">
            <h3>UBC Cubing Club</h3>
            <h4>Building a Community Through Cubing.</h4>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="mission-section">
          <div className="mission-header">
            <div className="mission-title-container">
              <h2>Our Mission</h2>
              <Image
                src="/about-mission-assets/mission_icon.svg"
                alt="Mission"
                height={22}
                width={22}
                className="mission-icon"
              />
            </div>

            <p>
              At the UBC Cubing Club, we aim to{" "}
              <strong>bring together cubers of all skill levels</strong> and
              create a community where everyone can learn, compete, and share
              their passion for speedcubing.
            </p>
          </div>

          <div className="mission-cards">
            <div className="mission-card">
              <div className="mission-media">
                <Image
                  src="/about-mission-assets/community.webp"
                  alt="Community"
                  fill
                  className="mission-media-content"
                />
              </div>

              <div className="mission-card-title">
                <h3>Community</h3>
                <Image
                  src="/about-mission-assets/community_icon.svg"
                  alt="Community"
                  height={22}
                  width={22}
                  className="mission-media-content"
                />
              </div>
              <p>
                Create a welcoming environment where beginners and experienced
                cubers can connect and improve together. Feel free to join our
                weekly meetings whether you&apos;re aiming to smash the club records,
                or just want to learn how to solve a Rubik&apos;s Cube for the first
                time!
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-media">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="mission-media-content"
                >
                  <source
                    src="/about-mission-assets/competition.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>

              <div className="mission-card-title">
                <h3>Competition</h3>
                <Image
                  src="/about-mission-assets/competition_icon.svg"
                  alt="Competition"
                  height={22}
                  width={22}
                  className="mission-media-content"
                />
              </div>
              <p>
                Host and sponsor official WCA competitions and provide opportunities for
                cubers to compete and achieve personal milestones.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-media">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="mission-media-content"
                >
                  <source
                    src="/about-mission-assets/growth.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>
              <div className="mission-card-title">
                <h3>Growth</h3>
                <Image
                  src="/about-mission-assets/growth_icon.svg"
                  alt="Growth"
                  height={22}
                  width={22}
                  className="mission-media-content"
                />
              </div>
              <p>
                Encourage skill development through meetups, practice sessions,
                and interclub events. We provide a platform for members to learn from each other
                and grow as cubers, whether it&apos;s improving your PB or learning new solving methods!
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
