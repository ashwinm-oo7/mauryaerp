import React, { useEffect, useState } from "react";
import axios from "../context/axiosConfig";
import "../css/UserDetail.css";
const roles = ["pending", "approved", "admin"];

const UserDetail = ({ user, refreshUsers }) => {
  const [role, setRole] = useState(user.role);
  const [companies, setCompanies] = useState(user.companies || []);
  const [status, setStatus] = useState("");
  const apiBase = process.env.REACT_APP_API_URL;
  console.log("Companies", user);
  const handleRoleChange = (e) => setRole(e.target.value);
  useEffect(() => {
    setRole(user.role);
    setCompanies(user.companies || []);
    setStatus(""); // reset status when user changes
  }, [user]);

  const handleCompanyChange = (index, field, value) => {
    const updated = [...companies];
    updated[index][field] = value;
    setCompanies(updated);
  };

  const addCompany = () => {
    setCompanies([...companies, { name: "", db: "", rights: 0 }]);
  };

  const removeCompany = (index) => {
    const updated = companies.filter((_, i) => i !== index);
    setCompanies(updated);
  };

  const saveChanges = async () => {
    const userId = user._id;
    try {
      await axios.post(`${apiBase}/admin/assign-access/${userId}`, {
        userId: user._id,
        companies,
        role,
      });

      setStatus("✅ Saved successfully");
      refreshUsers();
    } catch (err) {
      setStatus(
        "❌ Save failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="user-detail-card">
      <h3>User: {user.email}</h3>

      <div className="form-group">
        <label>Role</label>
        <select value={role} onChange={handleRoleChange}>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <h4>Companies & Rights</h4>
      {companies.map((comp, i) => (
        <div key={i} className="company-entry">
          <input
            type="text"
            placeholder="Company Name"
            value={comp.name}
            onChange={(e) => handleCompanyChange(i, "name", e.target.value)}
          />
          <input
            type="text"
            placeholder="DB Name"
            value={comp.db}
            onChange={(e) => handleCompanyChange(i, "db", e.target.value)}
          />
          <input
            type="number"
            placeholder="Rights"
            min={0}
            max={10}
            value={comp.rights}
            onChange={(e) =>
              handleCompanyChange(i, "rights", Number(e.target.value))
            }
          />
          <button onClick={() => removeCompany(i)} className="remove-btn">
            ❌
          </button>
        </div>
      ))}

      <button onClick={addCompany} className="add-btn">
        + Add Company
      </button>
      <button onClick={saveChanges} className="save-btn">
        💾 Save Changes
      </button>
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
};

export default UserDetail;
