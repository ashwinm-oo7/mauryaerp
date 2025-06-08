import React, { useEffect, useState } from "react";
import axios from "axios";

const DynamicForm = ({ formMeta }) => {
  const { controls = [], tablename } = formMeta;
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState({});

  // Fetch sabtable data for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      for (const control of controls) {
        if (control.controlType === "dropdown" && control.sabtable) {
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

    try {
      setLoading(true);
      setMsg("");
      setError("");
      const payload = { ...formData };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/mastertable/save/${tablename}`,
        payload
      );
      console.log("response", response);
      setMsg("✅ Saved successfully!");
      setFormData({});
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "❌ Error saving data. Please try again.";
      setError(errorMsg);

      setMsg("❌ Error saving data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {controls.map((control) => {
        const { controlType, label, options = [] } = control;

        switch (controlType) {
          case "input":
            return (
              <div key={label}>
                <label className="block font-medium">{label}</label>
                <input
                  type="text"
                  className="border px-2 py-1 rounded w-full"
                  value={formData[label] || ""}
                  onChange={(e) => handleChange(label, e.target.value)}
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
                <label className="block font-medium">{label}</label>
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

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>

      {msg && <div className="mt-2 text-green-600">{msg}</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </form>
  );
};

export default DynamicForm;
