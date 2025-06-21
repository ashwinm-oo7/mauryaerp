import React from "react";

const ConditionalControl = ({ condition, onChange }) => {
  return (
    <>
      {/* <label>Conditional Display (JS Logic):</label> */}
      <input
        type="text"
        value={condition}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`e.g. Country == 'India'`}
      />
      {/* <small style={{ color: "#888" }}>
        Example: <code>Age &gt; 18</code>, <code>Country == 'India'</code>
      </small> */}
    </>
  );
};

export default ConditionalControl;
