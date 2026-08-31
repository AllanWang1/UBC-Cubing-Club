"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUserRole, ADMIN_ROLES } from "@/app/lib/utils";
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
  const [userRole, setUserRole] = useState<string>("member");

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      if (role) {
        setUserRole(role);
      }
    };
    fetchUserRole();
  }, []);

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
  };

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
      {ADMIN_ROLES.includes(userRole) && (
        <button className="manage-requests-button">
          <Image
            src="/navbar-icons/membershipManagement.svg"
            width={20}
            height={20}
            alt="membership management icon"
          />
          <Link href="/members/membership-requests">
            Manage membership requests
          </Link>
        </button>
      )}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Faculty</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td
                className={
                  member.membership
                    ? `member-${member.role ? `${member.role}` : `paid`}`
                    : "non-member"
                }
              >
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
