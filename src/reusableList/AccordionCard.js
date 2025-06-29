import React, { useState } from "react";
import "../css/AccordionCard.css";

const AccordionCard = ({ item, controls, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  // Get visible controls
  const visibleControls = controls.filter((c) => c.visiblity !== false);

  return (
    <div className={`accordion-card ${expanded ? "expanded" : ""}`}>
      <div
        className="accordion-header"
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded((prev) => !prev);
        }}
      >
        {/* Show first 2-3 control labels as summary */}
        {visibleControls
          .slice(0, 3)
          .map(({ controlType, options = [], label }) => (
            <div key={label} title={`${label}: ${item[label] || "-"}`}>
              <strong>{controlType === "checkbox" ? label : options}: </strong>
              {typeof item[label] === "boolean"
                ? item[label]
                  ? "✅"
                  : "❌"
                : item[label]?.toString() || "-"}
            </div>
          ))}

        <div className="accordion-toggle">{expanded ? "▼" : "▶"}</div>
      </div>

      {expanded && (
        <div className="accordion-body">
          {/* Show all controls detailed */}
          {visibleControls.map(
            ({ label, options = [], controlType, subControls = [] }) => {
              const value = item[label];
              // Grid type control handling
              if (
                controlType === "grid" &&
                Array.isArray(value) &&
                value.length > 0
              ) {
                return (
                  <div key={label} className="grid-section">
                    <h4>{controlType === "checkbox" ? label : options}</h4>
                    <table className="grid-preview-table">
                      <thead>
                        <tr>
                          {subControls
                            .filter((sc) => sc.visiblity !== false)
                            .map((sc) => (
                              <th key={sc.label}>{sc.label}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {value.map((row, i) => (
                          <tr key={i}>
                            {subControls
                              .filter((sc) => sc.visiblity !== false)
                              .map((sc) => (
                                <td key={sc.label}>
                                  {row[sc.label]?.toString() || "-"}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <div key={label} className="df-field">
                  <div className="df-label">
                    {controlType === "checkbox" ? label : options}
                  </div>
                  <div className="df-value">
                    {controlType === "checkbox"
                      ? value
                        ? "✅"
                        : "❌"
                      : typeof value === "object"
                      ? Array.isArray(value)
                        ? value.length > 0
                          ? value.join(", ")
                          : "-"
                        : JSON.stringify(value)
                      : value || "-"}
                  </div>
                </div>
              );
            }
          )}

          <div className="accordion-actions">
            <button onClick={() => onEdit(item)}>✏️ Edit</button>
            <button onClick={() => onDelete(item._id)}>🗑️ Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccordionCard;
