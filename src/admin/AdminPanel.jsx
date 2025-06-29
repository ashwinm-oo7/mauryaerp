import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import UserDetail from "./UserDetail";
import "../css/Admin.css";
import { LoadingContext } from "../context/LoadingContext";
const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const [selectedUser, setSelectedUser] = useState(null);

  const [error, setError] = useState("");

  const apiBase = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!apiBase) {
        setError("API base URL is not defined in environment variables.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get(`${apiBase}/auth/verified-users`);

        if (!Array.isArray(response.data)) {
          throw new Error("Unexpected response format: expected an array.");
        }

        setUsers(response.data);
        console.log("Users :", users);
      } catch (err) {
        console.error("Error fetching verified users:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "An unknown error occurred while fetching users."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [apiBase]);

  return (
    <div className="admin-container">
      <div className="user-list">
        <h2>Verified Users</h2>

        {isLoading && <p>Loading users...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && users.length === 0 && (
          <p>No verified users found.</p>
        )}

        {!isLoading &&
          !error &&
          users.map((user) => (
            <div
              key={user._id}
              className="user-item"
              onClick={() => setSelectedUser(user)}
            >
              <p>
                <strong>Verify :{user.isVerified === "true"}</strong>
                <strong>{user.email || "No email"}</strong>
              </p>
              <p>Status: {user.role || "No role specified"}</p>
              <small>ID: {user._id || "No ID"}</small>
            </div>
          ))}
      </div>

      <div className="user-detail-panel">
        {selectedUser ? (
          <UserDetail user={selectedUser} />
        ) : (
          <p className="placeholder-text">
            Select a user to assign companies and rights
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
