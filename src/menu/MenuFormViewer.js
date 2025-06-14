import React from "react";
import "../css/MenuFormViewer.css";

const MenuFormViewer = ({ menu, currentIndex, total, onNext, onPrev }) => {
  if (!menu) return <p>No menu selected</p>;

  return (
    <div className="menu-form-viewer">
      <div className="menu-form-header">
        <h3>
          📋 Menu Details{" "}
          <span>
            ({currentIndex + 1} of {total})
          </span>
        </h3>
      </div>

      <div className="menu-form-grid">
        <div className="menu-form-field">
          <label>bname</label>
          <div className="field-value">{menu.bname}</div>
        </div>
        <div className="menu-form-field">
          <label>Table Name</label>
          <div className="field-value">{menu.tablename}</div>
        </div>
        <div className="menu-form-field">
          <label>Menu Name</label>
          <div className="field-value">{menu.MenuName}</div>
        </div>
        <div className="menu-form-field">
          <label>Parent Submenu</label>
          <div className="field-value">{menu.ParentSubmenuName}</div>
        </div>
        <div className="menu-form-field">
          <label>Form Type</label>
          <div className="field-value">{menu.FormType}</div>
        </div>
        <div className="menu-form-field">
          <label>Active</label>
          <div className={`badge ${menu.Active ? "yes" : "no"}`}>
            {menu.Active ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div className="menu-form-controls">
        <h4>🧩 Controls</h4>
        {menu?.controls?.length > 0 ? (
          <div className="controls-grid">
            {menu?.controls?.map((ctrl, index) => (
              <div className="control-card" key={index}>
                <div className="control-type">
                  <strong>{ctrl?.controlType}</strong>
                </div>
                <div className="control-label">{ctrl?.label}</div>
                {ctrl?.controlType === "dropdown" && (
                  <div className="dropdown-details">
                    <div className="sub-info">
                      Options:{" "}
                      <strong>{ctrl?.options?.join(", ") || "-"}</strong>
                    </div>
                    <div className="sub-info">
                      Sabtable: <strong>{ctrl?.sabtable || "-"}</strong>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-controls">No controls found</p>
        )}
      </div>

      <div className="menu-form-footer">
        <button onClick={onPrev} disabled={currentIndex === 0}>
          ⬅️ Previous
        </button>
        <button onClick={onNext} disabled={currentIndex >= total - 1}>
          Next ➡️
        </button>
      </div>
    </div>
  );
};

export default MenuFormViewer;
