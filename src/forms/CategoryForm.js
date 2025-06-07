import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/CategoryMaster.css";

const CategoryForm = ({ bname, editingData, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // 👇 Define all fields that should appear during 'Add' mode
  const defaultFields = ["categoryName"]; // You can extend this as needed

  useEffect(() => {
    if (editingData) {
      setFormData(editingData);
    } else {
      // Initialize formData with empty values for default fields
      const initial = {};
      defaultFields.forEach((key) => {
        initial[key] = "";
      });
      setFormData(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingData]);

  const validate = () => {
    const newErrors = {};
    for (let key in formData) {
      if (key !== "_id" && !formData[key]) {
        newErrors[key] = `${key} is required`;
      }
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (editingData?._id) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/mastertable/${bname}/${editingData._id}`,
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

      // Clear form and errors after submit
      const clearedForm = {};
      defaultFields.forEach((key) => (clearedForm[key] = ""));
      setFormData(clearedForm);
      setErrors({});
      onSuccess(); // tell parent to refresh list
    } catch (err) {
      console.error(err);
      setMessage("❌ Operation failed.");
    }
  };

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      {Object.keys(formData || {}).map((key) =>
        key === "_id" ? null : (
          <div className="form-group" key={key}>
            <label>{key}</label>
            <input
              name={key}
              value={formData[key] || ""}
              onChange={handleChange}
              className={errors[key] ? "error-input" : "category-input"}
            />
            {errors[key] && <span className="error-text">{errors[key]}</span>}
          </div>
        )
      )}
      <button type="submit" className="category-button">
        {editingData ? "Update" : "Add"}
      </button>
      {message && <p className="message">{message}</p>}
    </form>
  );
};

export default CategoryForm;
