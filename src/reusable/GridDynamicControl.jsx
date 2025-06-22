import React from "react";

const GridDynamicControl = ({ value = [], onChange, subControls }) => {
  const handleFieldChange = (rowIndex, field, fieldValue) => {
    const newData = [...value];
    newData[rowIndex] = { ...newData[rowIndex], [field]: fieldValue };
    onChange(newData);
  };

  const handleAddRow = () => {
    onChange([...value, {}]);
  };

  const handleRemoveRow = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="grid-dynamic-control">
      <div className="grid-header">
        {subControls.map((ctrl) => (
          <div key={ctrl.label} className="grid-cell">
            {ctrl.label}
          </div>
        ))}
        <div className="grid-cell">Actions</div>
      </div>

      {value.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {subControls.map((ctrl) => (
            <div className="grid-cell" key={ctrl.label}>
              {ctrl.controlType === "dropdown" ? (
                <select
                  value={row[ctrl.label] || ""}
                  onChange={(e) =>
                    handleFieldChange(rowIndex, ctrl.label, e.target.value)
                  }
                >
                  <option value="">Select {ctrl.label}</option>
                  {ctrl.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={row[ctrl.label] || ""}
                  onChange={(e) =>
                    handleFieldChange(rowIndex, ctrl.label, e.target.value)
                  }
                />
              )}
            </div>
          ))}
          <div className="grid-cell">
            <button onClick={() => handleRemoveRow(rowIndex)}>🗑️</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddRow}>
        ➕ Add Line Item
      </button>
    </div>
  );
};

export default GridDynamicControl;
