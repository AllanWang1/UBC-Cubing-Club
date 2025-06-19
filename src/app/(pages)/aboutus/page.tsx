import React from "react";
import "./About.css";
import Image from "next/image";
import teamMembers from "./Members.json";

const About = () => {
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
          <h2>Who We Are</h2>
        </div>

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

        <div className="section">
          <h2>Meet the Team</h2>
          <div className="team">
            {teamMembers.map((member, index) => (
              <div className="team-member" key={index}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={200}
                  height={200}
                  className="member-image"
                />
                <h4>{member.name}</h4>
                {member.roles && member.roles.length > 0 && (
                  <div className="roles">
                    {member.roles.map((role, i) => (
                      <p className="role" key={i}>
                        {role.title}
                        {role.years && ` (${role.years})`}
                      </p>
                    ))}
                  </div>
                )}
                <p>{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
