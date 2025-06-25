import React, { useContext, useState, useEffect } from "react";
import "../css/MenuRegistration.css";
import { MenuContext } from "../context/MenuContext";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import axios from "axios";
import { LoadingContext } from "../context/LoadingContext";

import GridComponent from "../reusable/GridComponent";
import ControlRow from "../reusable/ControlRow";

const MenuRegistration = () => {
  const { saberpmenu } = useContext(MenuContext);
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);
  const Navigate = useNavigate();
  const [draggedIndex, setDraggedIndex] = useState(null);
  const { setIsLoading } = useContext(LoadingContext);

  const [formData, setFormData] = useState({
    type: "form", // "menu" | "submenu" | "form"

    bname: "",
    tablename: "",
    MenuName: "",
    ParentSubmenuName: "",
    FormType: "M",
    Active: true,
    controls: [], // Array of dynamic fields
  });
  console.log("formData", formData.controls);
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index) => {
    if (index === draggedIndex) return;
    const updatedControls = [...formData.controls];
    const draggedItem = updatedControls[draggedIndex];
    updatedControls.splice(draggedIndex, 1);
    updatedControls.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setFormData((prev) => ({
      ...prev,
      controls: updatedControls,
    }));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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

  const addControl = (type, insertIndex = null) => {
    const newControl = {
      id: uuidv4(),
      controlType: type,
      label: "",
      caption: "",
      dataType: "",
      size: "",
      decimals: "",
      length: "",
      options: ["dropdown", "input"].includes(type) ? [] : [],
      sabtable: "",
      required: false,
      readOnly: false,
      entnoFormat: "",
      autoGenerate: false,
      ...(type === "grid" && { subControls: [] }), // 💥 Add subControls array for grid
    };

    setFormData((prev) => {
      const updatedControls = [...prev.controls];
      if (insertIndex !== null && insertIndex >= 0) {
        updatedControls.splice(insertIndex, 0, newControl); // insert at specific position
      } else {
        updatedControls.push(newControl); // default: append at end
      }

      return {
        ...prev,
        controls: updatedControls,
      };
    });
  };

  const handleLabelBlur = (id, value) => {
    const trimmedValue = value.trim().toLowerCase();
    if (trimmedValue === "") return; // Don't check empty

    const isDuplicate = formData.controls.some(
      (ctrl) =>
        ctrl.id !== id && ctrl.label.trim().toLowerCase() === trimmedValue
    );

    if (isDuplicate) {
      alert("❌ Label must be unique. This value is already used.");
    }
  };

  const updateControl = (id, field, value) => {
    const updatedControls = formData.controls.map((ctrl) => {
      if (ctrl.id !== id) return ctrl;

      let updatedCtrl = { ...ctrl, [field]: value };

      if (field === "dataType") {
        if (value === "int") updatedCtrl.size = 6;
        else if (value === "bigint") updatedCtrl.size = 12;
        else if (value === "decimal") updatedCtrl.size = 10;
        else updatedCtrl.size = ""; // for nvarchar or others

        // Reset decimals when switching off decimal
        if (value !== "decimal") updatedCtrl.decimals = "";
      }

      // 💡 Handle auto-generate logic when entnoFormat is updated
      if (
        field === "entnoFormat" ||
        (field === "label" && ctrl.dataType === "sequence")
      ) {
        const isEntnoField = updatedCtrl.label?.toLowerCase().includes("entno");
        const hasGenerateRule = updatedCtrl.entnoFormat?.trim();

        if (ctrl.dataType === "sequence" && isEntnoField && hasGenerateRule) {
          updatedCtrl.autoGenerate = true;
        } else {
          updatedCtrl.autoGenerate = false;
        }
      }

      return updatedCtrl;
    });

    setFormData((prev) => ({ ...prev, controls: updatedControls }));
  };
  const updateSubControl = (controlId, subIndex, field, value) => {
    const updatedControls = formData.controls.map((ctrl) => {
      if (ctrl.id !== controlId) return ctrl;
      const updatedSubControls = [...ctrl.subControls];
      updatedSubControls[subIndex] = {
        ...updatedSubControls[subIndex],
        [field]: value,
      };
      return {
        ...ctrl,
        subControls: updatedSubControls,
      };
    });
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
    const {
      MenuName,
      bname,
      ParentSubmenuName,
      tablename,
      type,
      Active,
      FormType,
    } = formData;

    // Ensure type selected
    if (!type) {
      alert("Please select the type (Menu, Submenu, Form).");
      return;
    }

    if (type === "menu") {
      const missingFields = [];

      if (!type) missingFields.push("type");
      if (typeof bname !== "string" || bname.trim() === "")
        missingFields.push("bname");
      if (typeof Active !== "boolean")
        missingFields.push("Active (must be true or false)");
      if (typeof FormType !== "string" || FormType.trim() === "")
        missingFields.push("FormType");

      if (missingFields.length > 0) {
        alert(`❌ Missing or invalid fields: ${missingFields.join(", ")}`);
        return;
      }
    }

    if (type === "submenu") {
      if (!MenuName || ParentSubmenuName || tablename) {
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
    formData.controls.forEach((ctrl) => {
      if (ctrl.controlType === "grid") {
        ctrl.subControls.forEach((sub) => {
          if (!sub.label?.trim()) {
            throw new Error("All grid sub-controls must have labels.");
          }
        });
      }
    });
    console.log("FINAL SUBMIT PAYLOAD:", JSON.stringify(formData, null, 2));

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

      const data = await res.json(); // Parse the response

      if (!res.ok) {
        // Handle errors from backend
        const msg = data.message || "Something went wrong!";
        alert(`❌ ${msg}`);
        return;
      }

      alert(id ? "✅ Updated successfully!" : "✅ Saved successfully!");
      if (!id) {
        setFormData({
          type: "form",
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
      console.error("Save error:", err);
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
            <option value="MD">Master Dublicate</option>
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
        {formData.type === "form" && (
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
              <button type="button" onClick={() => addControl("grid")}>
                ➕ Grid (Line Items)
              </button>
            </div>

            {formData.controls.map((ctrl, index) => (
              <>
                <ControlRow
                  key={ctrl.id}
                  ctrl={ctrl}
                  index={index}
                  draggedIndex={draggedIndex}
                  handleDragStart={handleDragStart}
                  handleDragEnter={handleDragEnter}
                  handleDragEnd={handleDragEnd}
                  updateControl={updateControl}
                  removeControl={removeControl}
                  addControl={addControl}
                  saberpmenu={saberpmenu}
                  handleLabelBlur={handleLabelBlur}
                />

                {/* Grid Part */}
                {ctrl.controlType === "grid" && (
                  <GridComponent
                    ctrl={ctrl}
                    saberpmenu={saberpmenu}
                    updateControl={updateControl}
                    updateSubControl={updateSubControl}
                  />
                )}
                {/* Grid Part */}
              </>
            ))}
          </div>
        )}

        <button type="submit" className="save-button">
          {id ? "Update" : "Save"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => Navigate("/menuregistrationlist")}
            className=" save-button cancel-button"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default MenuRegistration;
