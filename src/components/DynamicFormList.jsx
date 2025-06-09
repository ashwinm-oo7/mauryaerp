import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/DynamicFormList.css";

const DynamicFormList = ({ formMeta, onEdit, refreshTrigger }) => {
  const { tablename, controls = [] } = formMeta;
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${
            process.env.REACT_APP_API_URL
          }/api/mastertable/options/${tablename.replace(/\s/g, "")}/all`
        );
        setData(res.data.data || []);
      } catch (err) {
        console.error("Fetch data error:", err);
      }
    };
    fetchData();
  }, [tablename, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/mastertable/delete/${tablename}/${id}`
      );
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="df-list-container">
      <h2 className="df-list-title">📋 {tablename} Records</h2>

      <div className="df-table-wrapper">
        <table className="df-table">
          <thead className="df-thead">
            <tr className="df-tr">
              {controls.map((control) => (
                <th key={control.label} className="df-th">
                  {control.label}
                </th>
              ))}
              <th className="df-th">Actions</th>
            </tr>
          </thead>
          <tbody className="df-tbody">
            {data.map((row) => (
              <tr key={row._id} className="df-tr">
                {controls.map((control) => (
                  <td key={control.label} className="df-td">
                    {control.controlType === "checkbox"
                      ? row[control.label]
                        ? "✅"
                        : "❌"
                      : row[control.label] || "-"}
                  </td>
                ))}
                <td className="df-td df-action-cell">
                  <button
                    onClick={() => onEdit(row)}
                    className="df-btn df-btn-edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row._id)}
                    className="df-btn df-btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicFormList;
