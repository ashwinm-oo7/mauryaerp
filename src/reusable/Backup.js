import React, { useState } from "react";
import axios from "axios";

const Backup = () => {
  const [path, setPath] = useState("C:\\ERPBackups"); // default backup path
  const [status, setStatus] = useState("");

  const handleBackup = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/backup`,
        { path }
      );
      setStatus(`✅ ${response.data.message}`);
    } catch (error) {
      const errMsg = error.response?.data?.error || "Backup failed";
      setStatus(`❌ ${errMsg}`);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>📦 MongoDB Backup</h2>

      <label>📁 Backup Destination Folder:</label>
      <br />
      <select
        value={path}
        onChange={(e) => setPath(e.target.value)}
        style={{ width: "80%", padding: "8px" }}
      >
        <option value="C:\\ERPBackups">C:\ERPBackups</option>
        <option value="D:\\ERPBackups">D:\ERPBackups</option>
        <option value="/home/erp/backups">/home/erp/backups</option>
      </select>
      <br />
      <br />

      <button onClick={handleBackup} style={{ padding: "10px 20px" }}>
        🔄 Start Backup
      </button>

      {status && (
        <p style={{ marginTop: 20 }}>
          <strong>Status:</strong> {status}
        </p>
      )}
    </div>
  );
};

export default Backup;
