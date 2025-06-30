// Enhanced Admin Panel Plan:
// ✅ Role-based backend guard
// ✅ Pagination for user list
// ✅ Company autocomplete using datalist
// ✅ Export CSV/PDF

// --- Updated AdminPanel.jsx ---
import React, { useContext, useEffect, useState } from "react";
// import axios from "axios";
import axios from "../context/axiosConfig"; // update path if needed

import UserDetail from "./UserDetail";
import { LoadingContext } from "../context/LoadingContext";
import "../css/Admin.css";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isLoading, setIsLoading } = useContext(LoadingContext);
  const apiBase = process.env.REACT_APP_API_URL;
  const pageSize = 10;
  console.log("Adminusers", users);
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${apiBase}/admin/verified-users?page=${page}&limit=${pageSize}`
      );
      console.log(res);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = "Email,Role,Verified\n";
    const csv = users
      ?.map((u) => `${u.email},${u.role},${u.isVerified}`)
      .join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("User List", 10, 10);
    users.forEach((u, i) => {
      doc.text(`${u.email} | ${u.role} | ${u.isVerified}`, 10, 20 + i * 10);
    });
    doc.save("users.pdf");
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="admin-panel">
      <div className="sidebar">
        <h2>Verified Users</h2>
        <button onClick={exportCSV}>Export CSV</button>
        <button onClick={exportPDF}>Export PDF</button>
        {users?.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`user-item ${
              selectedUser?._id === user._id ? "active" : ""
            }`}
          >
            <strong>{user.email}</strong>
            <p>{user.role}</p>
          </div>
        ))}
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
            Next
          </button>
        </div>
      </div>

      <div className="user-detail-container">
        {selectedUser ? (
          <UserDetail user={selectedUser} refreshUsers={fetchUsers} />
        ) : (
          <p>Select a user to manage</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
