import React, { useContext, useState, useEffect } from "react";
import "../css/MenuRegistration.css";
import { MenuContext } from "../context/MenuContext";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import axios from "axios";
import { LoadingContext } from "../context/LoadingContext";

const MenuRegistration = () => {
  const { saberpmenu } = useContext(MenuContext);
  const { id } = useParams(); // For edit mode
  const { setIsLoading } = useContext(LoadingContext);
  const [menuType, setMenuType] = useState(""); // 'menu', 'submenu', or 'form'

  const [formData, setFormData] = useState({
    type: "", // "menu" | "submenu" | "form"

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
        setIsLoading(true);
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/menus/getMenuById/${id}`
          );
          console.log("fetchData", res.data);
          const normalizedControls = (res.data.controls || []).map((ctrl) => ({
            ...ctrl,
            id: ctrl._id || uuidv4(), // Assign internal id for rendering
          }));

          setFormData({
            ...res.data,
            controls: normalizedControls,
            type: detectType(res.data),
          });
        } catch (err) {
          console.error("Error loading menu:", err);
          alert("Failed to load menu for editing.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const detectType = (data) => {
    if (data.tablename && data.MenuName && data.ParentSubmenuName)
      return "form"; // Case B
    if (data.tablename && data.MenuName && !data.ParentSubmenuName)
      return "form"; // Case A
    if (data.tablename && !data.MenuName && !data.ParentSubmenuName)
      return "form"; // Case E
    if (data.MenuName && data.ParentSubmenuName && !data.tablename)
      return "submenu"; // Case D
    if (data.MenuName && !data.ParentSubmenuName && !data.tablename)
      return "menu"; // Case F
    return "";
  };

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
          options: ["dropdown", "input"].includes(type) ? [] : [],
          sabtable: "", // only relevant for dropdown
          required: false,
        },
      ],
    }));
  };

  const updateControl = (id, field, value) => {
    if (field === "label") {
      const isDuplicate = formData.controls.some(
        (ctrl) =>
          ctrl.id !== id &&
          ctrl.label.trim().toLowerCase() === value.trim().toLowerCase()
      );
      if (isDuplicate) {
        alert("❌ Label must be unique. This value is already used.");
        return;
      }
    }

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
    const { MenuName, ParentSubmenuName, tablename, type } = formData;

    // Ensure type selected
    if (!type) {
      alert("Please select the type (Menu, Submenu, Form).");
      return;
    }

    if (type === "menu") {
      if (!MenuName || ParentSubmenuName || tablename) {
        alert("For Menu type, only 'MenuName' should be filled.");
        return;
      }
    }

    if (type === "submenu") {
      if (!MenuName || !ParentSubmenuName || tablename) {
        alert(
          "For Submenu, only 'MenuName' and 'ParentSubmenuName' should be filled."
        );
        return;
      }
    }

    if (type === "form") {
      if (!tablename) {
        alert("For Form, 'tablename' is required.");
        return;
      }
      const caseA = MenuName && !ParentSubmenuName && tablename;
      const caseB = MenuName && ParentSubmenuName && tablename;
      const caseE = !MenuName && !ParentSubmenuName && tablename;

      if (!caseA && !caseB && !caseE) {
        alert("Invalid Form combination. Please check Menu/Submenu/tablename.");
        return;
      }
    }

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
      if (!id) {
        setFormData({
          bname: "",
          tablename: "",
          MenuName: "",
          ParentSubmenuName: "",
          FormType: "M",
          Active: true,
          controls: [],
        });
      }
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
        <div className="form-group">
          <label>
            <strong>Type:</strong>
          </label>
          <div className="menu-type-radio-group">
            {["menu", "submenu", "form"].map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={formData.type === value}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let cleared = { ...formData, type: newType };

                    if (newType === "menu") {
                      cleared = {
                        ...cleared,
                        MenuName: "",
                        ParentSubmenuName: "",
                        tablename: "",
                      };
                    } else if (newType === "submenu") {
                      cleared = {
                        ...cleared,
                        tablename: "",
                      };
                    }

                    setFormData(cleared);
                  }}
                />
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </label>
            ))}
          </div>
        </div>

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
              <label style={{ width: "" }}>{ctrl.controlType} Label:</label>
              <>
                <input
                  type="text"
                  placeholder="column name"
                  value={ctrl.label}
                  onChange={(e) =>
                    updateControl(ctrl.id, "label", e.target.value)
                  }
                />
              </>
              {ctrl.controlType === "input" && (
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
                    placeholder="Label Name"
                  />
                </>
              )}

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
                    placeholder="Label Name"
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
              {/* ✅ Required Toggle */}
              <select
                value={ctrl.required ? "true" : "false"}
                onChange={(e) =>
                  updateControl(ctrl.id, "required", e.target.value === "true")
                }
                className="required-toggle"
              >
                <option value="false">Required: No</option>
                <option value="true">Required: Yes</option>
              </select>

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
