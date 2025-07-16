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
};

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

  const informationInputs = [
    {
      label: "Full Name",
      type: "text",
      name: "fullName",
      placeHolder: "Enter your full name",
      required: true,
    },
    {
      label: "Student ID",
      type: "text",
      name: "studentId",
      placeHolder: "Enter your student ID (If applicable)",
      required: false,
    },
    {
      label: "Faculty of Study",
      type: "select",
      name: "faculty",
      placeholder: "Select your faculty",
      options: [
        "Applied Science",
        "Architecture and Landscape Architecture",
        "Arts",
        "Audiology and Speech Sciences",
        "Business",
        "Community and Regional Planning",
        "Dentistry",
        "Education",
        "Extended Learning",
        "Forestry",
        "Graduate and Postdoctoral Studies",
        "Journalism",
        "Kinesiology",
        "Land and Food Systems",
        "Law",
        "Library, Archival and Information Studies",
        "Medicine",
        "Music",
        "Nursing",
        "Pharmaceutical Sciences",
        "Population and Public Health",
        "Public Policy and Global Affairs",
        "Science",
        "Social Work",
        "UBC Vantage College",
        "Vancouver School of Economics",
        "External",
      ],
      required: true,
    },
    {
      label: "WCA ID",
      type: "text",
      name: "WCAId",
      placeHolder: "Enter your WCA ID (If applicable)",
      required: false,
    },
    {
      label: "Date of Birth",
      type: "date",
      name: "birthDate",
      placeHolder: "Select your date of birth",
      required: true,
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

  }
  
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
        {informationInputs.map((i) => (
          <div key={i.name} className="access-request-input">
            <label htmlFor={i.name}>{i.label}</label>
            {i.type === "select" ? (
              <select
                name={i.name}
                required={i.required}
                onChange={(e) => {handleChange(e)}}
              >
                {i.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input 
                name={i.name}
                type={i.type}
                placeholder={i.placeHolder}
                required={i.required}
                onChange={(e) => {handleChange(e)}}
              />
            )}
          </div>
        ))}
        <button type="submit" className="access-request-submit">
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default AccessRequest;
