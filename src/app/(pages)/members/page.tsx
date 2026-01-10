"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import "./Members.css";

interface Member {
  id: number;
  name: string;
  email: string | null;
  membership: boolean;
  faculty: string;
  user_id: string | null;
  role: "president" | "treasurer" | "admin" | "member";
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await fetch("/api/members");
      const res_json = await response.json();
      if (response.ok) {
        const sortedMembers = res_json.sort(sortMembers);
        setMembers(sortedMembers);
      } else {
        console.error("Error fetching members:", res_json.error);
      }
    };
    fetchMembers();
  }, []);

  const sortMembers = (a: Member, b: Member) => {
    if (a.role === "president") return -1;
    if (b.role === "president") return 1;
    if (a.role === "treasurer") return -1;
    if (b.role === "treasurer") return 1;
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (b.role === "admin" && a.role !== "admin") return 1;
    if (a.membership && !b.membership) return -1;
    if (!a.membership && b.membership) return 1;
    return a.id - b.id;
  }

  return (
    <div className="members">
      <div className="members-title">
        <Image
          src="/navbar-icons/members.svg"
          width={40}
          height={40}
          alt="members icon"
        />
        <h2>Members</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>Member ID</th>
            <th>Name</th>
            <th>Faculty</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.id}</td>
              <td className={member.membership ? `member-${member.role ? `${member.role}` : `paid`}` : "non-member"}>
                <Link href={`/members/${member.id}`}>{member.name}</Link>
              </td>
              <td>{member.faculty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Members;
