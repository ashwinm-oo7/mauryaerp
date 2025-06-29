import axios from "axios";
import React, { useState } from "react";

const UserDetail = ({ user }) => {
  const [companies, setCompanies] = useState([
    { name: "", db: "", rights: "" },
  ]);
  const apiBase = process.env.REACT_APP_API_URL;

  const handleAddCompany = () => {
    setCompanies([...companies, { name: "", db: "", rights: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...companies];
    updated[index][field] = value;
    setCompanies(updated);
  };

  const handleSubmit = () => {
    console.log("Assign to backend:", { userId: user._id, companies });
    axios.post(`${apiBase}/admin/assign-access`, {
      userId: user._id,
      companies,
    });
  };

  return (
    <div className="user-detail">
      <h3>Assign Access to: {user.email}</h3>
      {companies.map((c, i) => (
        <div key={i} className="company-block">
          <input
            type="text"
            placeholder="Company Name"
            value={c.name}
            onChange={(e) => handleChange(i, "name", e.target.value)}
          />
          <input
            type="text"
            placeholder="Database Name"
            value={c.db}
            onChange={(e) => handleChange(i, "db", e.target.value)}
          />
          <input
            type="number"
            placeholder="User Rights"
            value={c.rights}
            onChange={(e) => handleChange(i, "rights", e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleAddCompany}>+ Add Company</button>
      <button className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default UserDetail;
