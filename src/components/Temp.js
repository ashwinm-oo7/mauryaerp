import React, { useContext, useState } from "react";
import "../css/MenuRegistration.css";
import { MenuContext } from "../context/MenuContext";
import { Link } from "react-router-dom";

const MenuRegistration = () => {
  const {
    //  menus,
    saberpmenu,
  } = useContext(MenuContext);

  const [formData, setFormData] = useState({
    bname: "",
    tablename: "",
    MenuName: "",
    ParentSubmenuName: "",
    FormType: "M",
    Active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const detectEntryType = () => {
    const { bname, tablename, MenuName } = formData;

    if (bname && !tablename && !MenuName) return "Menu";
    if (bname && !tablename && MenuName) return "Submenu";
    if (bname && tablename && MenuName) return "Form";
    return "Invalid";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const entryType = detectEntryType();
    if (entryType === "Invalid") {
      alert("Invalid input combination. Check fields.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save menu");

      alert(`${entryType} saved successfully!`);
      setFormData({
        bname: "",
        tablename: "",
        MenuName: "",
        ParentSubmenuName: "",
        FormType: "M",
        Active: true,
      });
    } catch (err) {
      console.error(err);
      alert("Error saving menu.");
    }
  };

  return (
    <div className="menu-registration-container">
      <h2>Menu Registration</h2>
      <span>
        <Link to={`/menuregistrationlist`}>menuregistrationlist</Link>
      </span>

      <form onSubmit={handleSubmit} className="menu-form">
        <div className="form-group">
          <label>BName:</label>
          <input
            type="text"
            name="bname"
            value={formData.bname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Table Name:</label>
          <input
            type="text"
            name="tablename"
            value={formData.tablename}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Menu Name:</label>
          <select
            name="MenuName"
            value={formData.MenuName}
            onChange={handleChange}
            className="MenuRegistration-select"
          >
            <option value="">Select Menu</option>
            {saberpmenu.map((menu) => (
              <option key={menu._id} value={menu.bname}>
                {menu.bname}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>SubMenu Name:</label>
          <select
            name="ParentSubmenuName"
            value={formData.ParentSubmenuName}
            onChange={handleChange}
            className="MenuRegistration-select"
          >
            <option value="">Select Menu</option>
            {saberpmenu.map((menu) => (
              <option key={menu._id} value={menu.bname}>
                {menu.bname}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Form Type:</label>
          <select
            name="FormType"
            value={formData.FormType}
            onChange={handleChange}
            required
            className="MenuRegistration-select"
          >
            <option value="M">Master</option>
            <option value="T">Transaction</option>
            <option value="R">Report</option>
            <option value="I">Inventory</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>Active:</label>
          <input
            type="checkbox"
            name="Active"
            checked={formData.Active}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="save-button">
          Save
        </button>
      </form>
    </div>
  );
};

export default MenuRegistration;
