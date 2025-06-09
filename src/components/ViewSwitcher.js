// ViewSwitcher.js
import React from "react";
import "../css/ViewSwitcher.css";

const ViewSwitcher = ({ currentView, onChange }) => {
  return (
    <div className="view-switcher">
      <button
        className={currentView === "table" ? "active" : ""}
        onClick={() => onChange("table")}
      >
        📊 Table View
      </button>
      <button
        className={currentView === "card" ? "active" : ""}
        onClick={() => onChange("card")}
      >
        🗂️ Card View
      </button>
    </div>
  );
};

export default ViewSwitcher;
