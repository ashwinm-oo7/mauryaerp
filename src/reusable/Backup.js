import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
import axios from "../context/axiosConfig"; // update path if needed

import "../css/Backup.css";

const Backup = () => {
  const [path, setPath] = useState("C:\\ERPBackups");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const simulateProgress = () => {
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // stop at 95% until done
        return prev + Math.floor(Math.random() * 5 + 1); // simulate increase
      });
    }, 500);
  };

  const stopProgress = () => {
    clearInterval(progressIntervalRef.current);
    setProgress(100); // set to 100 on finish
    setTimeout(() => setProgress(0), 2000); // reset after 2s
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setStatus("⏳ Starting backup...");
    simulateProgress(); // Start fake progress

    try {
      // const response = await axios.post(
      //   `${process.env.REACT_APP_API_URL}/api/backup`,
      //   { path }
      // );
      const response = await axios.post(`/api/backup/backup`, { path });

      setStatus(`✅ ${response.data.message}`);
      fetchBackupList(); // refresh list
    } catch (error) {
      const errMsg = error.response?.data?.error || "❌ Backup failed";
      setStatus(`❌ ${errMsg}`);
    } finally {
      stopProgress();

      setIsLoading(false);
    }
  };

  const fetchBackupList = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/backup/list`
      );
      setBackups(res.data.backups);
    } catch (err) {
      console.error("Failed to load backups", err);
    }
  };

  const handleDownload = (folder, path) => {
    const url = `${process.env.REACT_APP_API_URL}/api/backup/download?folder=${folder}&path=${path}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    fetchBackupList();
  }, []);

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

      {isLoading && (
        <div className="erp-spinner-wrapper">
          <div className="erp-spinner">ERP</div>
          <div>Backing up, please wait...</div>
        </div>
      )}

      {!isLoading && status && (
        <p style={{ marginTop: 20 }}>
          <strong>Status:</strong> {status}
        </p>
      )}
      <div className="backup-progress-bar-container">
        <div className="backup-progress-bar" style={{ width: `${progress}%` }}>
          {progress > 0 && progress < 100 ? `${progress}%` : ""}
        </div>
      </div>

      <hr style={{ margin: "30px 0" }} />

      <h3>📁 Previous Backups:</h3>
      <ul>
        {backups.map((b, i) => (
          <li key={i}>
            📦 <strong>{b.folder}</strong> – stored at <code>{b.path}</code>{" "}
            <button onClick={() => handleDownload(b.folder, b.path)}>
              📥 Download ZIP
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Backup;
