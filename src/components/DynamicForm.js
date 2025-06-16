/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import "../css/DynamicForm.css";
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

  // ADD THIS useEffect to listen for changes in initialData
  useEffect(() => {
    setMsg("");
    setError("");
    setFormData(initialData || {});
    originalData.current = initialData || {};
  }, [initialData]);
  useEffect(() => {
    const hasChanges = Object.keys(formData).some(
      (key) => formData[key] !== originalData.current[key]
    );
    if (onDirtyChange) onDirtyChange(hasChanges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Fetch sabtable data for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      for (const control of controls) {
        if (control.controlType === "dropdown" && control.sabtable) {
          setIsLoading(true);
          try {
            const res = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/mastertable/options/${control.sabtable}`
            );
            setDropdownOptions((prev) => ({
              ...prev,
              [control.label]: res.data.options,
            }));
          } catch (err) {
            console.error("Error fetching dropdown options:", err);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    fetchDropdownData();
  }, [controls]);

  const handleChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
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
      const payload = { ...formData };
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
                <label className="block font-medium">
                  {options}:({label})
                </label>
                <input
                  type={isNumeric ? "number" : "text"}
                  inputMode={isNumeric ? "numeric" : "text"} // for mobile numeric keyboard
                  className="dynamic-form-input"
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
