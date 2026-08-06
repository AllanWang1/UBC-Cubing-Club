"use client";

import React from "react";
import { useEffect, useState } from "react";
import { AccessRequest } from "@/app/types/AccessRequest";
import { getUserRole, ADMIN_ROLES } from "@/app/lib/utils";
import { useRouter } from "next/navigation";

import "./membershipRequests.css";

const MembershipManagement = () => {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [userRole, setUserRole] = useState<string>("member");
  const router = useRouter();

  const fetchRequests = async () => {
    const response = await fetch("/api/membership-requests");
    const res_json = await response.json();

    if (response.ok) {
      setAccessRequests(res_json);
    } else {
      alert("Error fetching access requests: " + res_json.error);
    }
  };
  const handleDenial = (user_id: string) => async () => {
    const response = await fetch(`/api/membership-requests/${user_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res_json = await response.json();
    if (response.ok) {
      alert(`Successfully denied ${user_id}'s request`);
      fetchRequests();
    } else {
      alert(`Failed to deny ${user_id}'s request: ${res_json.error}`);
    }
  };

  const handleApproval = (request: AccessRequest) => async () => {
    // Requires 3 consecutive calls to APIs
    const response = await fetch(`/api/members/`, {
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
        `Successfully approved ${request.name}'s request: Member ID: ${member_id}`,
      );
      const authTableModifyResponse = await fetch(
        `/api/user-metadata/${request.user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            member_id: member_id,
            name: request.name,
          }),
        },
      );
      const auth_table_modify_res_json = await authTableModifyResponse.json();
      if (authTableModifyResponse.ok) {
        const deleteRequestResponse = await fetch(
          `/api/membership-requests/${request.user_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const delete_res_json = await deleteRequestResponse.json();
        if (!deleteRequestResponse.ok) {
          alert(
            `Failed to delete ${request.name}'s request: ${delete_res_json.error}`,
          );
        } else {
          // Refresh the list of access requests after successful approval and deletion
          fetchRequests();
        }
      } else {
        alert(
          `Failed to update ${request.name}'s metadata: ${auth_table_modify_res_json.error}`,
        );
      }
    } else {
      alert(`Failed to approve ${request.name}'s request: ${res_json.error}`);
    }
  };

  useEffect(() => {
    const getUserPermission = async () => {
      const role = await getUserRole();
      if (!role) {
        alert("You must be logged in to view this page");
        router.push("/login");
        return;
      } else {
        setUserRole(role);
      }
      if (role && !ADMIN_ROLES.includes(role)) {
        alert("You do not have access rights to view this page");
        router.push("/login");
        return;
      }
    };

    getUserPermission();
    fetchRequests();
  }, [router]);

  return ADMIN_ROLES.includes(userRole) ? (
    <div className="membership-requests">
      <h2>Access Requests</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Faculty</th>
            <th>Birthdate</th>
            <th>WCA ID</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {accessRequests.map((request) => (
            <tr key={request.user_id}>
              <td className="membership-requests-user-id-panel">
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
                <h3>{request.birthdate}</h3>
              </td>
              <td>
                <h3>{request.wca_id}</h3>
              </td>
              <td className="membership-requests-action-panel">
                <button onClick={handleApproval(request)}>Approve</button>
                <button onClick={handleDenial(request.user_id)}>Deny</button>
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
