"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/auth-js";
import { getCurrentUser } from "@/app/lib/utils";
import { useRouter } from "next/navigation";

import "./AccessRequest.css";

type AccessRequestProps = {
  fullName: string;
  email: string;
  studentId: string;
  faculty: string;
  WCAId: string;
  birthDate: Date;
}

const AccessRequest = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accessRequest, setAccessRequest] = useState<AccessRequestProps>({
    fullName: "",
    email: "",
    studentId: "",
    faculty: "External",
    WCAId: "",
    birthDate: new Date(),
  });
  const router = useRouter();

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    // Get the current user
    const validate = async () => {
      const fetchedUser = await getCurrentUser();

      if (!fetchedUser) {
        alert("You must be logged in to request access to membership");
        router.push("/signin");
        return;
      }
      if (fetchedUser?.user_metadata?.member_id) {
        alert("You are already a member");
        router.push(`/members/${fetchedUser.user_metadata.member_id}`);
        return;
      }
      // At this point the user is logged in and not a member.
      setUser(fetchedUser);
    };

    validate();
  }, [router]);
  return (
    <div className="access-request">
      <h2>Request Membership</h2>
      <h3>Please note the following:</h3>
      <ul className="members-access-request-info">
        <li>
          There will be a charge of $5 membership fee that you need to
          e-transfer or pay at our in-person meeting for your request to be
          processed successfully
        </li>
        <li>
          Your request will be processed within 1-3 days after you make the
          payment.
        </li>
      </ul>
      <form className="access-request-form" onSubmit={handleRequest}>
        <input type="text" />
      </form>
    </div>
  );
};

export default AccessRequest;
