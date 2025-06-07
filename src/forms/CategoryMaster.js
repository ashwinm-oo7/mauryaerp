// CategoryMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/CategoryMaster.css";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";

const CategoryMaster = ({ bname }) => {
  const [records, setRecords] = useState([]);
  const [editingData, setEditingData] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mastertable/${bname}`
      );
      if (Array.isArray(res.data.data)) setRecords(res.data.data);
      else setRecords([]);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data.");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bname]);

  const handleEdit = (item) => {
    setEditingData(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/mastertable/${bname}/${id}`
      );
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete record.");
    }
  };

  return (
    <div className="category-container">
      <h2 className="category-title">{bname} Master</h2>
      <CategoryForm
        bname={bname}
        editingData={editingData}
        onSuccess={() => {
          setEditingData(null);
          fetchData();
        }}
      />
      {error && <p className="error-text">{error}</p>}
      <CategoryList
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CategoryMaster;
