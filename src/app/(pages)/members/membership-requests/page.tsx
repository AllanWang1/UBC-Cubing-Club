"use client";

import React from "react";
import { useEffect, useState } from "react";
import { AccessRequest } from "@/app/types/AccessRequest";
import { getUserRole, ADMIN_ROLES } from "@/app/lib/utils";

import "./membershipRequests.css";

const MembershipManagement = () => {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [userRole, setUserRole] = useState<string>("member");
  const handleApproval = (request: AccessRequest) => async () => {
    const response = await fetch(`/api/members/${request.user_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const res_json = await response.json();
    if (response.ok) {
      // we also get the data from the response, so we have the member id to trigger the next function
      const member_id = res_json.id;
      alert(
        `Successfully approved ${request.name}'s request: Member ID: ${member_id}`
      );
      const reverseResponse = await fetch(`/api/access-request/reverse/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: request.user_id,
          member_id: member_id,
          name: request.name,
        }),
      });
    } else {
      alert(`Failed to approve ${request.name}'s request: ${res_json.error}`);
    }
  };

  useEffect(() => {
    const getUserPermission = async () => {
      const role = await getUserRole();
      if (role) {
        setUserRole(role);
      }
      // Handle no user and error cases silently, as we have the default "all" permission
    };

    getUserPermission();
  }, []);

  useEffect(() => {
    if (!ADMIN_ROLES.includes(userRole)) return;

    const fetchRequests = async () => {
      const response = await fetch("/api/access-request");
      const res_json = await response.json();

      if (response.ok) {
        setAccessRequests(res_json);
      } else {
        console.error("Error fetching meetings:", res_json.error);
      }
    };

    fetchRequests();
  }, [userRole]);

  return ADMIN_ROLES.includes(userRole) ? (
    <div className="TempRequestHandler">
      <h2>Access Requests</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Faculty</th>
            <th>StudentId</th>
            <th>Birthdate</th>
            <th>WCA ID</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {accessRequests.map((request) => (
            <tr key={request.user_id}>
              <td>
                <h3>{request.user_id}</h3>
              </td>
              <td>
                <h3>{request.name}</h3>
              </td>
              <td>
                <h3>{request.email}</h3>
              </td>
              <td>
                <h3>{request.faculty}</h3>
              </td>
              <td>
                <h3>{request.student_id}</h3>
              </td>
              <td>
                <h3>{request.birthdate}</h3>
              </td>
              <td>
                <h3>{request.wca_id}</h3>
              </td>
              <td>
                <button onClick={handleApproval(request)}>Approve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <h2>You do not have access rights to view this page</h2>
  );
};

export default MembershipManagement;
