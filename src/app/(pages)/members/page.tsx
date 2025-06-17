"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import "./Members.css";

interface Member {
  id: number;
  name: string;
  email: string | null;
  student_id: string | null;
  membership: boolean;
  position: string | null;
  faculty: string;
  user_id: string | null;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await fetch("/api/members");
      const res_json = await response.json();
      if (response.ok) {
        setMembers(res_json);
      } else {
        console.error("Error fetching members:", res_json.error);
      }
    };
    fetchMembers();
  }, []);

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
              {/* the member position can only be null, "President", or "Treasurer" */}
              <td className={member.membership ? `member-${member.position ? `${member.position}` : `paid`}` : "non-member"}>
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
