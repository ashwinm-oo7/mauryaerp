/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import "../css/DynamicForm.css";
import "../css/DynamicFormGrid.css";

import { LoadingContext } from "../context/LoadingContext";

const DynamicForm = ({
  formMeta,
  initialData,
  onSubmitDone,
  onDirtyChange,
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const { controls = [], tablename } = formMeta;
  // const [isLoading, setIsLoading] = useState(false);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState({});
  const originalData = useRef(initialData || {});
  const [gridData, setGridData] = useState({});

  // ADD THIS useEffect to listen for changes in initialData
  // useEffect(() => {
  //   setMsg("");
  //   setError("");
  //   setFormData(initialData || {});
  //   originalData.current = initialData || {};
  // }, [initialData]);

  useEffect(() => {
    setMsg("");
    setError("");

    const updatedData = { ...(initialData || {}) };

    // Set current IST date for controls with defaultDateOption === "currentDate"
    const getCurrentDateInIST = () => {
      const nowUTC = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(nowUTC.getTime() + istOffset);
      return istTime.toISOString().split("T")[0];
    };

    formMeta.controls?.forEach((control) => {
      if (
        control.dataType === "date" &&
        control.defaultDateOption === "currentDate" &&
        !updatedData[control.label]
      ) {
        updatedData[control.label] = getCurrentDateInIST();
      }
    });

    setFormData(updatedData);
    const initialGridData = {};
    formMeta.controls?.forEach((control) => {
      if (control.controlType === "grid") {
        initialGridData[control.label] = initialData?.[control.label] || [{}]; // Start with one empty row
      }
    });
    setGridData(initialGridData);

    originalData.current = updatedData;
  }, [initialData]);

  useEffect(() => {
    const hasChanges = Object.keys(formData).some(
      (key) => formData[key] !== originalData.current[key]
    );
    if (onDirtyChange) onDirtyChange(hasChanges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Fetch sabtable data for dropdowns
  // useEffect(() => {
  //   const fetchDropdownData = async () => {
  //     for (const control of controls) {
  //       if (control.controlType === "dropdown" && control.sabtable) {
  //         setIsLoading(true);
  //         try {
  //           const res = await axios.get(
  //             `${process.env.REACT_APP_API_URL}/api/mastertable/options/${control.sabtable}`
  //           );
  //           setDropdownOptions((prev) => ({
  //             ...prev,
  //             [control.label]: res.data.options,
  //           }));
  //         } catch (err) {
  //           console.error("Error fetching dropdown options:", err);
  //         } finally {
  //           setIsLoading(false);
  //         }
  //       }
  //     }
  //   };

  //   fetchDropdownData();
  // }, [controls]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const allDropdowns = [];

      // Get dropdowns from top-level controls
      for (const control of controls) {
        if (control.controlType === "dropdown" && control.sabtable) {
          allDropdowns.push({
            label: control.label,
            sabtable: control.sabtable,
          });
        }

        // If grid control, loop through its subControls
        if (
          control.controlType === "grid" &&
          Array.isArray(control.subControls)
        ) {
          for (const subCtrl of control.subControls) {
            if (subCtrl.controlType === "dropdown" && subCtrl.sabtable) {
              const key = `${control.label}__${subCtrl.label}`; // Composite key to avoid conflicts
              allDropdowns.push({ label: key, sabtable: subCtrl.sabtable });
            }
          }
        }
      }

      // Fetch all dropdown options
      for (const { label, sabtable } of allDropdowns) {
        try {
          setIsLoading(true);
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/mastertable/options/${sabtable}`
          );
          setDropdownOptions((prev) => ({
            ...prev,
            [label]: res.data.options,
          }));
        } catch (err) {
          console.error("Error fetching dropdown options:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDropdownData();
  }, [controls]);

  const handleChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };
  const handleGridChange = (gridLabel, rowIndex, field, value) => {
    setGridData((prev) => {
      const updatedRows = [...(prev[gridLabel] || [])];
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: value };
      return { ...prev, [gridLabel]: updatedRows };
    });
  };

  const addGridRow = (gridLabel) => {
    setGridData((prev) => ({
      ...prev,
      [gridLabel]: [...(prev[gridLabel] || []), {}],
    }));
  };

  const removeGridRow = (gridLabel, rowIndex) => {
    setGridData((prev) => {
      const updatedRows = [...(prev[gridLabel] || [])];
      updatedRows.splice(rowIndex, 1);
      return { ...prev, [gridLabel]: updatedRows };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tablename) {
      alert("No table name specified for this form.");
      return;
    }
    // ✅ Validate required fields
    const missingFields = controls
      .filter((control) => control.required)
      .filter((control) => {
        const value = formData[control.label];
        if (control.controlType === "checkbox") {
          // return value !== true;
        }
        return value === undefined || value === null || value === "";
      });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((f) => f.label).join(", ");
      setError(`Please fill all required fields: ${fieldNames}`);
      return;
    }

    try {
      setIsLoading(true);
      setMsg("");
      setError("");
      // clone existing formData
      const payload = { ...formData };

      // add only sequence fields with entnoFormat
      controls.forEach((control) => {
        if (
          control.dataType === "sequence" &&
          control.entnoFormat &&
          !formData[control.label]
        ) {
          // set format string in payload (e.g. "0000")
          payload["entnoFormat"] = control.entnoFormat;
        }
      });
      Object.entries(gridData).forEach(([gridLabel, rows]) => {
        payload[gridLabel] = rows;
      });

      let response;
      if (initialData?._id) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/mastertable/update/${tablename}/${initialData._id}`,
          payload
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/mastertable/save/${tablename}`,
          payload
        );
      }
      console.log("response", response);
      setMsg("✅ Saved successfully!");
      setFormData({});
      if (onSubmitDone) onSubmitDone();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "❌ Error saving data. Please try again.";
      setError(errorMsg);

      setMsg("❌ Error saving data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {controls.map((control) => {
        const { controlType, label, options = [] } = control;

        switch (controlType) {
          case "input":
            const isNumeric =
              control.dataType === "int" ||
              control.dataType === "bigint" ||
              control.dataType === "decimal";
            const inputLength = Number(control.length) || undefined;

            return (
              <div key={label}>
                <label
                  // className="block font-medium"
                  className={
                    control.readOnly
                      ? "readonly-label block font-medium"
                      : "block font-medium"
                  }
                >
                  {options}:({label})
                </label>
                {control.dataType === "date" ? (
                  <input
                    type="date"
                    // className="dynamic-form-input"
                    className={
                      control.readOnly
                        ? "dynamic-form-input readonly-label"
                        : "dynamic-form-input"
                    }
                    value={
                      formData[label] ||
                      (control.defaultDateOption === "currentDate"
                        ? new Date().toISOString().split("T")[0]
                        : "")
                    }
                    onChange={(e) => handleChange(label, e.target.value)}
                    disabled={control.readOnly}
                  />
                ) : (
                  <input
                    type={isNumeric ? "number" : "text"}
                    inputMode={isNumeric ? "numeric" : "text"} // for mobile numeric keyboard
                    className="dynamic-form-input"
                    disabled={control.readOnly}
                    value={formData[label] || ""}
                    min={0}
                    maxLength={
                      control.dataType !== "nvarcharv"
                        ? inputLength || undefined
                        : undefined
                    }
                    onChange={(e) => {
                      let value = e.target.value;

                      // Optional: Prevent entry of non-numeric characters
                      if (isNumeric) {
                        if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
                          const digitCount = value.replace(/\D/g, "").length;
                          if (!inputLength || digitCount <= inputLength) {
                            handleChange(label, value);
                          }
                        }
                      } else {
                        handleChange(label, value);
                      }
                    }}
                  />
                )}
              </div>
            );

          case "checkbox":
            return (
              <div key={label} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData[label] || false}
                  onChange={(e) => handleChange(label, e.target.checked)}
                />
                <label>{label}</label>
              </div>
            );

          case "dropdown":
            const optionsForDropdown = dropdownOptions[label] || [];

            return (
              <div key={label}>
                <label className="block font-medium">
                  {options}:({label})
                </label>
                <select
                  className="border px-2 py-1 rounded w-full"
                  value={formData[label] || ""}
                  onChange={(e) => handleChange(label, e.target.value)}
                >
                  <option value="">Select {label}</option>
                  {optionsForDropdown.map((opt) => (
                    <option key={opt.value} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          case "grid":
            const columnCount = control.subControls.length + 1; // +1 for "Actions"
            const gridTemplate = `repeat(${columnCount}, minmax(140px, 1fr))`;

            return (
              <div key={label} className="dynamic-grid-wrapper">
                <label className="block font-bold mb-2">{label}</label>
                <div className="dynamic-grid-scroll-container">
                  <div
                    className="grid-header "
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {control.subControls.map((sub) => (
                      <div
                        key={sub.label}
                        className="grid-cell-header grid-data-row"
                      >
                        <input
                          className="grid-input grid-header-input"
                          value={sub?.label?.toUpperCase()}
                          readOnly
                          tabIndex={-1}
                        />
                        {/* {sub.label} */}
                      </div>
                    ))}
                    <div className="grid-cell-header grid-data-row">
                      {" "}
                      <input
                        className="grid-input grid-header-input"
                        value="Actions"
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                  </div>

                  {(gridData[label] || []).map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid-data-row"
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {control.subControls.map((sub) => {
                        const subLabel = sub.label;
                        const value = row[subLabel] || "";

                        switch (sub.controlType) {
                          case "input":
                            return (
                              <input
                                key={subLabel}
                                type={
                                  ["int", "decimal", "bigint"].includes(
                                    sub.dataType
                                  )
                                    ? "number"
                                    : "text"
                                }
                                placeholder={subLabel}
                                value={value}
                                className="grid-input"
                                onChange={(e) =>
                                  handleGridChange(
                                    label,
                                    rowIndex,
                                    subLabel,
                                    e.target.value
                                  )
                                }
                              />
                            );

                          case "dropdown":
                            const optionsKey = `${label}__${subLabel}`;
                            const options = dropdownOptions[optionsKey] || [];
                            return (
                              <select
                                key={subLabel}
                                value={value}
                                className="grid-select"
                                onChange={(e) =>
                                  handleGridChange(
                                    label,
                                    rowIndex,
                                    subLabel,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select {subLabel}</option>
                                {options.map((opt) => (
                                  <option key={opt.value} value={opt.label}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            );

                          case "checkbox":
                            return (
                              <label
                                key={subLabel}
                                className="grid-checkbox-label"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!value}
                                  onChange={(e) =>
                                    handleGridChange(
                                      label,
                                      rowIndex,
                                      subLabel,
                                      e.target.checked
                                    )
                                  }
                                />
                                {subLabel}
                              </label>
                            );

                          default:
                            return (
                              <span key={subLabel} className="text-red-600">
                                Unknown sub-control type: {sub.controlType}
                              </span>
                            );
                        }
                      })}
                      <button
                        type="button"
                        className="remove-row-btn"
                        onClick={() => removeGridRow(label, rowIndex)}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="add-row-btn"
                  onClick={() => addGridRow(label)}
                >
                  ➕ Add Row
                </button>
              </div>
            );

          default:
            return (
              <div key={label} className="text-red-600">
                ❌ Unknown control type: {controlType}
              </div>
            );
        }
      })}

      <div
        className={
          initialData?._id
            ? "DynamicForm-form-buttons updateextra "
            : "DynamicForm-form-buttons noextra "
        }
      >
        <button
          type="submit"
          className="DynamicForm-submit-button"
          disabled={isLoading}
        >
          {isLoading
            ? initialData?._id
              ? "🔄 Updating..."
              : "💾 Saving..."
            : initialData?._id
            ? "🔄 Update"
            : "💾 Save"}
        </button>

        {initialData?._id && (
          <button
            type="button"
            className="DynamicForm-cancel-button"
            onClick={() => {
              setFormData({});
              if (onSubmitDone) onSubmitDone(); // switch to 'add' mode
            }}
          >
            ❌ Cancel
          </button>
        )}
      </div>

      {msg && <div className="mt-2 text-green-600">{msg}</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </form>
  );
};

export default DynamicForm;
