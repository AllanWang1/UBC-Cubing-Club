"use client";

import { useEffect, useState } from "react";

interface Member {
  id: number;
  name: string | null;
  email: string | null;
  student_id: string | null;
  membership: boolean;
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
    }
    fetchMembers();
  }, []);

  return (
    <div className="members">
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <div className="member-container">
              <h3>{member.name}</h3>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Members
