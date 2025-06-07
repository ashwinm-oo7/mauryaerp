// forms/CategoryMaster.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/CategoryMaster.css";
import CategoryForm from "../forms/CategoryForm";
import CategoryList from "../forms/CategoryList";

const CategoryMaster = ({ bname }) => {
  const [formData, setFormData] = useState({});
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mastertable/${bname}`
      );
      if (Array.isArray(res.data.data)) {
        setRecords(res.data.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Fetch error", err);
      setRecords([]);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bname]);

  const validate = () => {
    const errors = {};
    for (const key in formData) {
      if (key !== "_id" && !formData[key]?.trim()) {
        errors[key] = `${key} is required`;
      }
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("❌ Please fix validation errors.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/mastertable/${bname}/${editingId}`,
          formData
        );
        setMessage("✅ Updated successfully!");
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/mastertable`, {
          bname,
          ...formData,
        });
        setMessage("✅ Created successfully!");
      }
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save");
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/mastertable/${bname}/${id}`
      );
      fetchData();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  return (
    <div className="category-container">
      <h2 className="category-title">{bname} Form</h2>
      <CategoryForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        message={message}
        validationErrors={validationErrors}
      />
      <CategoryList
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CategoryMaster;
