import React from "react";

const DynamicGridFormula = ({
  label,
  subControls,
  gridData,
  setGridData,
  dropdownOptions,
}) => {
  console.log("subControls", subControls);
  const visibleSubControls = subControls.filter(
    (sub) => sub.visiblity !== false
  );

  const updateGridValue = (rowIndex, field, value) => {
    setGridData((prev) => {
      const updatedRows = [...(prev[label] || [])];
      const updatedRow = { ...updatedRows[rowIndex], [field]: value };

      // 🔁 Check if this field is used in any operationRule
      subControls.forEach((sub) => {
        const rule = sub.operationRule;
        if (
          rule &&
          (rule.leftOperand === field || rule.rightOperand === field)
        ) {
          const left = parseFloat(updatedRow[rule.leftOperand]) || 0;
          const right = parseFloat(updatedRow[rule.rightOperand]) || 0;
          let result = "";

          switch (rule.operator) {
            case "+":
              result = left + right;
              break;
            case "-":
              result = left - right;
              break;
            case "*":
              result = left * right;
              break;
            case "/":
              result = right !== 0 ? left / right : 0;
              break;
            default:
              break;
          }

          updatedRow[sub.label] = result;
        }
      });

      updatedRows[rowIndex] = updatedRow;
      return { ...prev, [label]: updatedRows };
    });
  };

  const addRow = () => {
    setGridData((prev) => ({
      ...prev,
      [label]: [...(prev[label] || []), {}],
    }));
  };

  const removeRow = (rowIndex) => {
    setGridData((prev) => {
      const updated = [...(prev[label] || [])];
      updated.splice(rowIndex, 1);
      return { ...prev, [label]: updated };
    });
  };

  const columnCount = visibleSubControls.length + 1;
  const gridTemplate = `repeat(${columnCount}, minmax(182px, 1fr))`;
  const rows = gridData[label] || [];
  // ✅ Calculate totals for fields with sumRequired
  const sumFields = visibleSubControls
    .filter((sub) => sub.sumRequired)
    .map((sub) => sub.label);

  const totals = sumFields.reduce((acc, label) => {
    acc[label] = rows.reduce(
      (sum, row) => sum + (parseFloat(row[label]) || 0),
      0
    );
    return acc;
  }, {});

  return (
    <div className="dynamic-grid-wrapper">
      <div className="dynamic-grid-scroll">
        {/* === HEADER ROW === */}
        <div
          className="dynamic-grid-row dynamic-grid-header"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {visibleSubControls.map((sub) => (
            <div key={sub.label} className="grid-header-cell">
              <span className="grid-header-label">
                {sub.header?.toUpperCase()}
              </span>
            </div>
          ))}
          <div className="grid-header-cell">
            <span className="grid-header-label">ACTIONS</span>
          </div>
        </div>
        {/* === DATA ROWS === */}
        {(gridData[label] || []).map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="dynamic-grid-row dynamic-grid-data"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {visibleSubControls.map((sub) => {
              const subLabel = sub.label;
              const value = row[subLabel] || "";
              const readOnly = sub.readOnly;

              switch (sub.controlType) {
                case "input":
                  const isNumber = ["int", "decimal", "bigint"].includes(
                    sub.dataType
                  );
                  return (
                    <input
                      key={subLabel}
                      type={isNumber ? "number" : "text"}
                      placeholder={subLabel}
                      value={value}
                      className={`grid-cell-input ${
                        readOnly ? "readonly-red" : ""
                      }`}
                      disabled={readOnly}
                      onChange={(e) =>
                        updateGridValue(rowIndex, subLabel, e.target.value)
                      }
                      {...(isNumber ? { min: 0 } : {})}
                    />
                  );

                case "dropdown":
                  const optionsKey = `${label}__${subLabel}`;
                  const options = dropdownOptions[optionsKey] || [];
                  return (
                    <select
                      key={subLabel}
                      value={value}
                      className={`grid-cell-select ${
                        readOnly ? "readonly-red" : ""
                      }`}
                      disabled={readOnly}
                      onChange={(e) =>
                        updateGridValue(rowIndex, subLabel, e.target.value)
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
                      className={`grid-cell-checkbox ${
                        readOnly ? "readonly-red" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!value}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateGridValue(rowIndex, subLabel, e.target.checked)
                        }
                      />
                      {subLabel}
                    </label>
                  );

                default:
                  return (
                    <span key={subLabel} className="grid-cell-error">
                      ❌ Unknown: {sub.controlType}
                    </span>
                  );
              }
            })}

            {/* === ACTION BUTTON === */}
            <button
              type="button"
              className="grid-remove-btn"
              onClick={() => removeRow(rowIndex)}
            >
              ❌ Remove
            </button>
          </div>
        ))}{" "}
        {/* FOOTER TOTALS */}
        {sumFields.length > 0 && (
          <div
            className="dynamic-grid-row dynamic-grid-footer"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {visibleSubControls.map((sub) => (
              <div key={sub.label} className="grid-footer-cell">
                {sumFields.includes(sub.label) ? (
                  <strong>{totals[sub.label].toFixed(2)}</strong>
                ) : (
                  ""
                )}
              </div>
            ))}
            <div className="grid-footer-cell">
              <strong>Total</strong>
            </div>
          </div>
        )}
      </div>
      {/* === TOTALS ROW === */}

      <button type="button" className="grid-add-btn" onClick={addRow}>
        ➕ Add Row
      </button>
    </div>
  );
};

export default DynamicGridFormula;
