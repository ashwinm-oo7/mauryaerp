// components/CategoryList.js
import React from "react";
import "../css/CategoryMaster.css";

const CategoryList = ({ records, onEdit, onDelete }) => {
  if (!records?.length) return <p>No records found.</p>;

  return (
    <div className="category-list">
      <h3>Existing Records</h3>
      {records.map((record) => (
        <div className="category-item" key={record._id}>
          {Object.entries(record)
            .filter(([key]) => key !== "_id" && key !== "__v")
            .map(([key, value]) => (
              <span key={key}>
                <strong>{key}:</strong> {value}{" "}
              </span>
            ))}
          <button onClick={() => onEdit(record)} className="edit-btn">
            ✏️
          </button>
          <button onClick={() => onDelete(record._id)} className="delete-btn">
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
