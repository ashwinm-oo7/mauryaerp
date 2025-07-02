import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import "../css/AuditLogViewer.css";

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/admin/audit-logs");
        setLogs(res.data.logs);
        setFiltered(res.data.logs);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      logs.filter(
        (log) =>
          log.action.toLowerCase().includes(lower) ||
          log.userEmail.toLowerCase().includes(lower)
      )
    );
  }, [search, logs]);

  return (
    <div className="auditlog-container">
      <h2>🔍 Admin Audit Logs</h2>

      <input
        type="text"
        placeholder="Search by action or user email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="auditlog-search"
      />

      <div className="auditlog-table-wrapper">
        <table className="auditlog-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>User Email</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, index) => (
              <tr key={log._id}>
                <td>{index + 1}</td>
                <td>{log.action}</td>
                <td>{log.userEmail}</td>
                <td>
                  <pre>{JSON.stringify(log.details, null, 2)}</pre>
                </td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogViewer;
