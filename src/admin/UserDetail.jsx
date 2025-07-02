import React, { useEffect, useState } from "react";
import axios from "../context/axiosConfig";
import "../css/UserDetail.css";
const roles = ["pending", "approved", "admin", "rejected"];
const accessOptions = ["Developer", "Admin", "User"]; // New dropdown options

const UserDetail = ({ user, refreshUsers }) => {
  const [role, setRole] = useState(user.role);
  const [userAccess, setUserAccess] = useState(user.userAccess || "User"); // New state

  const [companies, setCompanies] = useState(user.companies || []);
  const [status, setStatus] = useState("");
  const apiBase = process.env.REACT_APP_API_URL;
  console.log("Companies", user);
  const handleRoleChange = (e) => setRole(e.target.value);
  const handleAccessChange = (e) => setUserAccess(e.target.value); // New handler
  useEffect(() => {
    setRole(user.role);
    setUserAccess(user.userAccess || "User");

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
        userAccess,
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
      <h3 className="user-detail-card__title">User: {user.email}</h3>

      <div className="form-group">
        <label className="form-group__label">Role</label>
        <select
          className="form-group__select"
          value={role}
          onChange={handleRoleChange}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-group__label">User Access</label>
        <select
          className="form-group__select"
          value={userAccess}
          onChange={handleAccessChange}
        >
          {accessOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <h4>Companies & Rights</h4>
      {companies.map((comp, i) => (
        <div key={i} className="company-entry">
          <input
            className="company-entry__input"
            type="text"
            placeholder="Company Name"
            value={comp.name}
            onChange={(e) => handleCompanyChange(i, "name", e.target.value)}
          />
          <input
            className="company-entry__input"
            type="text"
            placeholder="DB Name"
            value={comp.db}
            onChange={(e) => handleCompanyChange(i, "db", e.target.value)}
          />
          <input
            type="number"
            className="company-entry__input"
            placeholder="Rights"
            min={0}
            max={100}
            value={comp.rights}
            onChange={(e) =>
              handleCompanyChange(i, "rights", Number(e.target.value))
            }
          />
          <button
            onClick={() => removeCompany(i)}
            className="user-detail-card__btn remove-btn"
          >
            ❌
          </button>
        </div>
      ))}

      <button
        onClick={addCompany}
        className="user-detail-card__btn user-detail-card__btn--add"
      >
        + Add Company
      </button>
      <button
        onClick={saveChanges}
        className="user-detail-card__btn user-detail-card__btn--save"
      >
        💾 Save Changes
      </button>
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
};

export default UserDetail;
