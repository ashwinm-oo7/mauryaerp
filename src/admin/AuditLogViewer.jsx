import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import "../css/AuditLogViewer.css";
import LogTable from "../reusable/LogTable";

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const columns = [
    { header: "SrNo", accessor: (log, i) => i + 1 },
    { header: "Action", accessor: (log) => log.action },
    { header: "User Email", accessor: (log) => log.userEmail },
    {
      header: "Details",
      accessor: (log) => (
        <div className="details-table">
          {Object.entries(log.details || {}).map(([key, value]) => (
            <div className="detail-row" key={key}>
              <strong>{key}:</strong>{" "}
              {Array.isArray(value) ? (
                <ul>
                  {value.map((v, i) => (
                    <li key={i}>
                      {typeof v === "object" ? JSON.stringify(v) : v}
                    </li>
                  ))}
                </ul>
              ) : typeof value === "object" ? (
                <pre>{JSON.stringify(value, null, 2)}</pre>
              ) : (
                <span>{String(value)}</span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Timestamp",
      accessor: (log) => new Date(log.timestamp).toLocaleString(),
    },
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/admin/audit-logs");
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.status?.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="auditlog-container">
      <h2>📘 Audit Logs</h2>
      <input
        type="text"
        placeholder="🔍 Search by action, email, status, or IP..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="auditlog-search"
      />
      <LogTable data={filteredLogs} columns={columns} title="Audit Logs" />
    </div>
  );
};

export default AuditLogViewer;
