// components/DynamicControl.js
import React from "react";

const DynamicControl = ({ ctrl, formValues, onChange }) => {
  const evaluateVisibility = () => {
    if (!ctrl.visibleIf) return true;
    try {
      const condition = ctrl.visibleIf.replace(
        /\b(\w+)\b/g,
        "formValues['$1']"
      );
      // eslint-disable-next-line no-eval
      return eval(condition);
    } catch (err) {
      console.warn("Invalid visibleIf condition:", ctrl.visibleIf);
      return true;
    }
  };

  if (!evaluateVisibility()) return null;

  const handleChange = (e) => {
    const { value, checked, type } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    onChange(ctrl.label, fieldValue);
  };

  switch (ctrl.controlType) {
    case "input":
      return (
        <div className="form-group">
          <label>{ctrl.label}</label>
          <input
            type="text"
            value={formValues[ctrl.label] || ""}
            onChange={handleChange}
            readOnly={ctrl.readOnly}
            required={ctrl.required}
          />
        </div>
      );
    case "dropdown":
      return (
        <div className="form-group">
          <label>{ctrl.label}</label>
          <select
            value={formValues[ctrl.label] || ""}
            onChange={handleChange}
            disabled={ctrl.readOnly}
            required={ctrl.required}
          >
            <option value="">Select</option>
            {ctrl.options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    case "checkbox":
      return (
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formValues[ctrl.label] || false}
              onChange={handleChange}
            />
            {ctrl.label}
          </label>
        </div>
      );
    default:
      return null;
  }
};

export default DynamicControl;
