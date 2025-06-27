import React from "react";
import "../css/DynamicFormListGrid.css";

const GridWithSum = ({ label, rows, subControls }) => {
  // Identify fields that need summing
  const sumFields = subControls.filter((sub) => sub.sumRequired);

  // Compute sums
  const totals = {};
  sumFields.forEach((sub) => {
    totals[sub.label] = rows.reduce((acc, curr) => {
      const val = parseFloat(curr[sub.label]) || 0;
      return acc + val;
    }, 0);
  });

  return (
    <div className="classic-grid-wrapper">
      <div className="classic-grid-table">
        {/* Header */}
        <div className="classic-grid-header">
          {subControls.map((sub) => (
            <div className="classic-grid-cell header" key={sub.label}>
              {sub.header || sub.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((rowData, rowIndex) => (
          <div className="classic-grid-row" key={rowIndex}>
            {subControls.map((sub) => (
              <div className="classic-grid-cell" key={sub.label}>
                {rowData[sub.label] ?? "-"}
              </div>
            ))}
          </div>
        ))}

        {/* Sum Footer */}
        {sumFields.length > 0 && (
          <div className="classic-grid-footer">
            {subControls.map((sub) => (
              <div className="classic-grid-cell footer" key={sub.label}>
                {sub.sumRequired ? totals[sub.label]?.toFixed(2) : ""}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GridWithSum;
