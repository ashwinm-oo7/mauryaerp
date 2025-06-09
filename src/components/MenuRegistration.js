import React, { useContext, useState, useEffect } from "react";
import "../css/MenuRegistration.css";
import { MenuContext } from "../context/MenuContext";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import axios from "axios";

const MenuRegistration = () => {
  const { saberpmenu } = useContext(MenuContext);
  const { id } = useParams(); // For edit mode

  const [formData, setFormData] = useState({
    bname: "",
    tablename: "",
    MenuName: "",
    ParentSubmenuName: "",
    FormType: "M",
    Active: true,
    controls: [], // Array of dynamic fields
  });
  console.log("formData", formData.controls);
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/menus/getMenuById/${id}`
          );
          console.log("fetchData", res.data);
          const normalizedControls = (res.data.controls || []).map((ctrl) => ({
            ...ctrl,
            id: ctrl._id || uuidv4(), // Assign internal id for rendering
          }));

          setFormData({ ...res.data, controls: normalizedControls });
        } catch (err) {
          console.error("Error loading menu:", err);
          alert("Failed to load menu for editing.");
        }
      };

      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addControl = (type) => {
    setFormData((prev) => ({
      ...prev,
      controls: [
        ...prev.controls,
        {
          id: uuidv4(),
          controlType: type, // 'input' | 'checkbox' | 'dropdown'
          label: "",
          options: type === "dropdown" ? ["Option 1"] : [],
          sabtable: "", // only relevant for dropdown
        },
      ],
    }));
  };

  const updateControl = (id, field, value) => {
    const updatedControls = formData.controls.map((ctrl) =>
      ctrl.id === id ? { ...ctrl, [field]: value } : ctrl
    );
    setFormData((prev) => ({ ...prev, controls: updatedControls }));
  };

  const removeControl = (id) => {
    setFormData((prev) => ({
      ...prev,
      controls: prev.controls.filter((ctrl) => ctrl.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation logic (same as before)
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${process.env.REACT_APP_API_URL}/api/menus/updateMenu/${id}`
      : `${process.env.REACT_APP_API_URL}/api/menus`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save menu");

      alert(id ? "✅ Updated successfully!" : "✅ Saved successfully!");
      setFormData({
        bname: "",
        tablename: "",
        MenuName: "",
        ParentSubmenuName: "",
        FormType: "M",
        Active: true,
        controls: [],
      });
    } catch (err) {
      console.error(err);
      alert("Error saving menu.");
    }
  };

  return (
    <div className="menu-registration-container">
      <h2>{id ? "Edit Menu" : "New Menu Registration"}</h2>
      <span>
        <Link to="/menuregistrationlist" className="menu-back-link">
          ← menuregistrationlist
        </Link>
      </span>

      <form onSubmit={handleSubmit} className="menu-form">
        {/* Static Fields */}
        {["bname", "tablename"].map((field) => (
          <div className="form-group" key={field}>
            <label>{field}:</label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={field === "bname"}
            />
          </div>
        ))}

        {/* Dropdowns for Menu */}
        {["MenuName", "ParentSubmenuName"].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.replace("Name", " Name")}:</label>
            <select
              name={field}
              value={formData[field]}
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
        ))}

        <div className="form-group">
          <label>Form Type:</label>
          <select
            name="FormType"
            value={formData.FormType}
            onChange={handleChange}
            className="MenuRegistration-select"
            required
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

        {/* Dynamic Controls Section */}
        <div className="dynamic-controls">
          <h3>Form Controls</h3>
          <div className="add-buttons">
            <button type="button" onClick={() => addControl("input")}>
              ➕ Input Box
            </button>
            <button type="button" onClick={() => addControl("checkbox")}>
              ➕ Checkbox
            </button>
            <button type="button" onClick={() => addControl("dropdown")}>
              ➕ Dropdown
            </button>
          </div>

          {formData.controls.map((ctrl, index) => (
            <div key={ctrl.id} className="control-row">
              <label>{ctrl.controlType} Label:</label>
              <input
                type="text"
                value={ctrl.label}
                onChange={(e) =>
                  updateControl(ctrl.id, "label", e.target.value)
                }
              />
              {ctrl.controlType === "dropdown" && (
                <>
                  <input
                    type="text"
                    value={ctrl?.options?.join(", ")}
                    onChange={(e) =>
                      updateControl(
                        ctrl.id,
                        "options",
                        e.target.value.split(",").map((opt) => opt.trim())
                      )
                    }
                    placeholder="Comma-separated options"
                  />

                  <select
                    value={ctrl?.sabtable}
                    onChange={(e) =>
                      updateControl(ctrl.id, "sabtable", e.target.value)
                    }
                  >
                    <option value="">Or select table (sabtable)</option>
                    {saberpmenu.map((menu) =>
                      menu.tablename ? (
                        <option key={menu._id} value={menu.tablename}>
                          {menu.tablename}
                        </option>
                      ) : null
                    )}
                  </select>
                </>
              )}

              <button
                type="button"
                onClick={() => removeControl(ctrl.id)}
                className="remove-control-btn"
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="save-button">
          {id ? "Update" : "Save"}
        </button>
      </form>
    </div>
  );
};

export default MenuRegistration;
