import React, { useContext, useState, useEffect } from "react";
import "../css/MenuRegistration.css";
import { MenuContext } from "../context/MenuContext";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import axios from "axios";
import { LoadingContext } from "../context/LoadingContext";
import EntnoGenerator from "../reusable/EntnoGenerator";
import DynamicControl from "../reusable/DynamicControl";
import ConditionalControl from "../reusable/ConditionalControl";

const MenuRegistration = () => {
  const { saberpmenu } = useContext(MenuContext);
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);
  const Navigate = useNavigate();

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
  const [formValues, setFormValues] = useState({});

  const handleControlChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
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

  const addControlwait = (type) => {
    setFormData((prev) => ({
      ...prev,
      controls: [
        ...prev.controls,
        {
          id: uuidv4(),
          controlType: type, // 'input' | 'checkbox' | 'dropdown'
          label: "",
          caption: "",
          dataType: "",
          size: "",
          decimals: "", // For decimal types
          length: "",
          options: ["dropdown", "input"].includes(type) ? [] : [],
          sabtable: "", // only relevant for dropdown
          required: false,
          readOnly: false,
          entnoFormat: "",
          autoGenerate: false,
        },
      ],
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

  // const updateControl = (id, field, value) => {
  //   const updatedControls = formData.controls.map((ctrl) =>
  //     ctrl.id === id ? { ...ctrl, [field]: value } : ctrl
  //   );
  //   setFormData((prev) => ({ ...prev, controls: updatedControls }));
  // };

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
                    onBlur={(e) => handleLabelBlur(ctrl.id, e.target.value)}
                  />
                  {/* <input
                  type="text"
                  placeholder="Caption name"
                  value={ctrl.caption}
                  onChange={(e) =>
                    updateControl(ctrl.id, "caption", e.target.value)
                  }
                  onBlur={(e) => handleLabelBlur(ctrl.id, e.target.value)}
                /> */}
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
                    {/* DataType selection */}
                    <select
                      value={ctrl.dataType}
                      onChange={(e) =>
                        updateControl(ctrl.id, "dataType", e.target.value)
                      }
                    >
                      <option value="">Select Datatype</option>

                      <option value="nvarchar">NVARCHAR</option>
                      <option value="int">INT</option>
                      <option value="bigint">BIGINT</option>
                      <option value="decimal">DECIMAL</option>
                      <option value="date">DATE</option>
                      <option value="sequence">Sequence</option>
                    </select>

                    {/* Size input */}
                    {ctrl.dataType !== "date" &&
                      ctrl.dataType !== "sequence" && (
                        <input
                          type="number"
                          placeholder="Size"
                          value={ctrl.size}
                          onChange={(e) =>
                            updateControl(ctrl.id, "size", e.target.value)
                          }
                          style={{ width: "60px", marginLeft: "5px" }}
                          min={0}
                          readOnly={["int", "bigint"].includes(ctrl.dataType)} // <— this line
                        />
                      )}
                    {/* Decimal places input (only when dataType === decimal) */}
                    {ctrl.dataType === "decimal" && (
                      <input
                        type="number"
                        placeholder="Decimals"
                        value={ctrl.decimals}
                        onChange={(e) =>
                          updateControl(ctrl.id, "decimals", e.target.value)
                        }
                        style={{ width: "80px", marginLeft: "5px" }}
                        min={0}
                      />
                    )}
                    {/* length input */}
                    {ctrl.dataType !== "nvarchar" &&
                      ctrl.dataType !== "date" &&
                      ctrl.dataType !== "sequence" && (
                        <input
                          type="number"
                          placeholder="length"
                          value={ctrl.length}
                          onChange={(e) =>
                            updateControl(ctrl.id, "length", e.target.value)
                          }
                          style={{ width: "60px", marginLeft: "5px" }}
                          min={0}
                          // readOnly={["int", "bigint"].includes(ctrl.dataType)}
                        />
                      )}
                    {ctrl.dataType === "date" && (
                      <select
                        value={ctrl.defaultDateOption || ""}
                        onChange={(e) =>
                          updateControl(
                            ctrl.id,
                            "defaultDateOption",
                            e.target.value
                          )
                        }
                        style={{ marginLeft: "5px" }}
                      >
                        <option value="">Select Date Option</option>
                        <option value="currentDate">Current Date</option>
                      </select>
                    )}
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
                    updateControl(
                      ctrl.id,
                      "required",
                      e.target.value === "true"
                    )
                  }
                  className="required-toggle"
                >
                  <option value="false">Required: No</option>
                  <option value="true">Required: Yes</option>
                </select>
                {ctrl.controlType === "input" &&
                  ctrl.dataType === "sequence" && (
                    <EntnoGenerator
                      value={ctrl.entnoFormat}
                      lastNumber={123}
                      user={"ADMIN"} // You can get it from auth context
                      onChange={(formatted, template) =>
                        updateControl(ctrl.id, "entnoFormat", template)
                      }
                    />
                  )}{" "}
                {ctrl.controlType !== "checkbox" && (
                  <ConditionalControl
                    condition={ctrl.conditionalVisibility}
                    onChange={(val) =>
                      updateControl(ctrl.id, "conditionalVisibility", val)
                    }
                  />
                )}
                {ctrl.controlType !== "checkbox" && (
                  <input
                    style={{
                      boxShadow: "none",
                      width: "100px",
                      cursor: "pointer",
                    }}
                    title="Read Only"
                    type="checkbox"
                    checked={ctrl.readOnly || false}
                    onChange={(e) =>
                      updateControl(ctrl.id, "readOnly", e.target.checked)
                    }
                    placeholder="ReadOnly"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeControl(ctrl.id)}
                  className="remove-control-btn"
                >
                  ❌
                </button>
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                    marginTop: "5px",
                  }}
                >
                  <select
                    value=""
                    onChange={(e) => {
                      const [pos, type] = e.target.value.split("|");
                      if (pos === "above") addControl(type, index);
                      else if (pos === "below") addControl(type, index + 1);
                    }}
                  >
                    <option value="">➕ Add Control...</option>
                    <option value={`above|input`}>⬆️ Input Above</option>
                    <option value={`above|dropdown`}>⬆️ Dropdown Above</option>
                    <option value={`above|checkbox`}>⬆️ Checkbox Above</option>
                    <option value={`below|input`}>⬇️ Input Below</option>
                    <option value={`below|dropdown`}>⬇️ Dropdown Below</option>
                    <option value={`below|checkbox`}>⬇️ Checkbox Below</option>
                  </select>
                </div>
              </div>
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
