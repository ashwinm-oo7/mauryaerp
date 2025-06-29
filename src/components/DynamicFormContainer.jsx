import React, { useState, useRef } from "react";
import DynamicForm from "./DynamicForm";
import DynamicFormList from "./DynamicFormList";
import "../css/DynamicFormContainer.css";

const DynamicFormContainer = ({ formMeta }) => {
  const [activeTab, setActiveTab] = useState("list");
  const [editingData, setEditingData] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  const isDirty = useRef(false); // Track form dirtiness

  const handleEdit = (rowData) => {
    setEditingData(rowData);
    setActiveTab("update");
  };

  const handleFormSubmit = () => {
    setEditingData(null);
    setRefreshList((prev) => !prev);
    isDirty.current = false;
    setActiveTab("list");
  };

  const handleTabClick = (tab) => {
    // Only trigger confirm if leaving an update with unsaved changes
    if (
      isDirty.current &&
      activeTab === "update" &&
      tab !== "update" &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
    ) {
      return;
    }

    if (tab !== "update") {
      setEditingData(null);
      isDirty.current = false;
    }

    setActiveTab(tab);
  };

  return (
    <div className="dynamic-form-container">
      <div className="dynamic-form-tabs">
        <button
          onClick={() => handleTabClick("add")}
          className={activeTab === "add" ? "active" : ""}
        >
          ➕ Add New
        </button>
        {editingData && (
          <button
            onClick={() => handleTabClick("update")}
            className={activeTab === "update" ? "active" : ""}
          >
            🛠️ Update
          </button>
        )}
        <button
          onClick={() => handleTabClick("list")}
          className={activeTab === "list" ? "active" : ""}
        >
          📋 List Records
        </button>
      </div>

      {(activeTab === "add" || activeTab === "update") && (
        <DynamicForm
          formMeta={formMeta}
          initialData={activeTab === "update" ? editingData : null}
          onSubmitDone={handleFormSubmit}
          onDirtyChange={(dirty) => {
            isDirty.current = dirty;
          }}
        />
      )}

      {activeTab === "list" && (
        <DynamicFormList
          formMeta={formMeta}
          onEdit={handleEdit}
          refreshTrigger={refreshList}
        />
      )}
    </div>
  );
};

export default DynamicFormContainer;
