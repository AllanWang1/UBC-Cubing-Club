"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Member {
  id: number;
  name: string | null;
  email: string | null;
  student_id: string | null;
  membership: boolean;
  major: string;
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
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <div className="member-container">
              <Link href={`/members/${member.id}`}>
                <h3>{member.id}</h3>
                {member.name !== null && member.name !== undefined && (
                  <h3>{member.name}</h3>
                )}
                <h3>{member.major}</h3>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Members;
