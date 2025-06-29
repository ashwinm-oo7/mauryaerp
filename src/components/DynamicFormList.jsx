import React, { useState, useEffect } from "react";
// import axios from "axios";
import axios from "../context/axiosConfig"; // update path if needed

import "../css/DynamicFormList.css";
import "../css/DynamicFormListGrid.css";
import GridWithSum from "../reusable/GridWithSum";
import AccordionList from "../reusableList/AccordionList";

const PAGE_SIZE = 6;

const DynamicFormList = ({ formMeta, onEdit, refreshTrigger }) => {
  const { tablename, controls = [] } = formMeta;
  const visibleControls = controls.filter((c) => c.visiblity !== false);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState("single"); // single or grid
  const [sortField, setSortField] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  console.log("DynamicFormList", controls, visibleControls);
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${
            process.env.REACT_APP_API_URL
          }/api/mastertable/options/${tablename.replace(/\s/g, "")}/all`
        );
        setData(res?.data?.data?.reverse() || []);
      } catch (err) {
        console.error("Fetch data error:", err);
      }
    };
    fetchData();
  }, [tablename, refreshTrigger]);
  console.log("Form Colum records Data", data);
  // Apply sort & filter whenever data, sortField, or filter changes
  useEffect(() => {
    let temp = [...data];

    // Filtering
    if (filterField && filterValue !== "") {
      temp = temp.filter((item) => {
        const val = item[filterField];
        if (typeof val === "boolean") {
          return val === (filterValue === "true");
        } else if (typeof val === "string") {
          return val.toLowerCase().includes(filterValue.toLowerCase());
        }
        return true;
      });
    }

    // Sorting
    if (sortField) {
      temp.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1;
        if (a[sortField] > b[sortField]) return 1;
        return 0;
      });
    }

    setFilteredData(temp);
    setPage(0); // reset page on new filter/sort
    setCurrentIndex(0); // reset index for single view
  }, [data, sortField, filterField, filterValue]);

  // Handlers for delete
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

  // Render single card with navigation (your existing one)
  const renderSingleCardwait = () => {
    const row = filteredData[currentIndex];
    if (!row) return <p className="text-gray-500">No record available</p>;

    return (
      <div className="df-card-view">
        <div className="df-card">
          {controls.map(({ controlType, label, options = [] }) => {
            const value = row[label];

            return (
              <div
                key={label}
                className={
                  controlType === "grid"
                    ? "classic-grid-container"
                    : "df-card-field"
                }
              >
                <strong className="classic-grid-label">
                  {controlType === "checkbox" ? label : options}
                </strong>

                {controlType === "checkbox" ? (
                  <span className="classic-checkbox-value">
                    {value ? "✅" : "❌"}
                  </span>
                ) : controlType === "grid" &&
                  Array.isArray(value) &&
                  value.length > 0 ? (
                  <div className="classic-grid-wrapper">
                    <div className="classic-grid-table">
                      {/* <div className="classic-grid-header">
                        {Object.keys(value[0]).map((colKey) => (
                          <div
                            className="classic-grid-cell header"
                            key={colKey}
                          >
                            {colKey}
                          </div>
                        ))}
                      </div> */}
                      <div className="classic-grid-header">
                        {controls
                          .find(
                            (ctrl) =>
                              ctrl.controlType === "grid" &&
                              ctrl.label.toLowerCase() === label.toLowerCase()
                          )
                          ?.subControls?.map((sub) => (
                            <div
                              className="classic-grid-cell header"
                              key={sub.label}
                            >
                              {sub.header || sub.label}
                            </div>
                          ))}
                      </div>

                      {value.map((rowData, rowIndex) => (
                        <div className="classic-grid-row" key={rowIndex}>
                          {/* {Object.entries(rowData).map(([col, val]) => (
                            <div className="classic-grid-cell" key={col}>
                              {val || "-"}
                            </div>
                          ))} */}
                          {controls
                            .find(
                              (ctrl) =>
                                ctrl.controlType === "grid" &&
                                ctrl.label === label
                            )
                            ?.subControls?.map((sub) => (
                              <div
                                className="classic-grid-cell"
                                key={sub.label}
                              >
                                {rowData[sub.label] || "-"}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="classic-grid-default-value">
                    {value || "-"}
                  </span>
                )}
              </div>
            );
          })}

          <div className="df-card-actions">
            <button onClick={() => onEdit(row)} className="df-btn df-btn-edit">
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDelete(row._id)}
              className="df-btn df-btn-delete"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        <div className="df-card-nav">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className={`transition px-4 py-2 rounded border ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-800 hover:bg-blue-100 hover:border-blue-500"
            }`}
          >
            ◀️ Previous
          </button>
          <span>
            <span className="text-gray-600 font-medium">
              {currentIndex + 1} of {filteredData.length}
            </span>
          </span>
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                Math.min(prev + 1, filteredData.length - 1)
              )
            }
            disabled={currentIndex === filteredData.length - 1}
            className={`transition px-4 py-2 rounded border ${
              currentIndex === filteredData.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-800 hover:bg-blue-100 hover:border-blue-500"
            }`}
          >
            Next ▶️
          </button>
        </div>
      </div>
    );
  };
  const renderSingleCard = () => {
    const row = filteredData[currentIndex];
    if (!row) return <p className="text-gray-500">No record available</p>;

    return (
      <div className="df-card-view">
        <div className="df-card">
          {visibleControls.map(({ controlType, label, options = [] }) => {
            const value = row[label];

            return (
              <div
                key={label}
                className={
                  controlType === "grid"
                    ? "classic-grid-container"
                    : "df-card-field"
                }
              >
                <strong className="classic-grid-label">
                  {controlType === "checkbox" ? label : options}
                </strong>

                {controlType === "checkbox" ? (
                  <span className="checkbox-value">{value ? "✅" : "❌"}</span>
                ) : controlType === "grid" &&
                  Array.isArray(value) &&
                  value.length > 0 ? (
                  <GridWithSum
                    label={label}
                    rows={value}
                    subControls={
                      visibleControls
                        .find(
                          (ctrl) =>
                            ctrl.controlType === "grid" &&
                            ctrl.label.toLowerCase() === label.toLowerCase()
                        )
                        ?.subControls?.filter(
                          (sub) => sub.visiblity !== false
                        ) || []
                    }
                  />
                ) : (
                  <span className="classic-grid-default-value">
                    {value || "-"}
                  </span>
                )}
              </div>
            );
          })}

          <div className="df-card-actions">
            <button onClick={() => onEdit(row)} className="df-btn df-btn-edit">
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDelete(row._id)}
              className="df-btn df-btn-delete"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        <div className="df-card-nav">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className={`transition px-4 py-2 rounded border ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-800 hover:bg-blue-100 hover:border-blue-500"
            }`}
          >
            ◀️ Previous
          </button>
          <span>
            <span className="text-gray-600 font-medium">
              {currentIndex + 1} of {filteredData.length}
            </span>
          </span>
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                Math.min(prev + 1, filteredData.length - 1)
              )
            }
            disabled={currentIndex === filteredData.length - 1}
            className={`transition px-4 py-2 rounded border ${
              currentIndex === filteredData.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-800 hover:bg-blue-100 hover:border-blue-500"
            }`}
          >
            Next ▶️
          </button>
        </div>
      </div>
    );
  };

  // Render grid cards for current page with pagination
  const renderGridView = () => (
    <AccordionList
      data={filteredData}
      controls={visibleControls}
      onEdit={onEdit}
      onDelete={handleDelete}
      page={page}
      setPage={setPage}
      pageSize={PAGE_SIZE}
    />
  );

  // table
  const renderTableView = () => (
    <div className="df-table-wrapper">
      <table className="df-table">
        <thead className="df-thead">
          <tr className="df-tr">
            <th className="df-th">Sr. No</th>

            {/* {controls.map((control) => (
              <th key={control.label} className="df-th">
                {control?.label}
              </th>
            ))} */}
            {visibleControls.map(({ controlType, label, options = [] }) => (
              <th key={label} className="df-th">
                {controlType === "checkbox" ? label : options}
              </th>
            ))}
            <th className="df-th">Actions</th>
          </tr>
        </thead>
        <tbody className="df-tbody">
          {filteredData.map((row, index) => (
            <tr key={row._id} className="df-tr">
              <td className="df-td">{index + 1}</td>
              {controls.map((control) => (
                <td key={control.label} className="df-td">
                  {control.controlType === "checkbox"
                    ? row[control.label]
                      ? "✅"
                      : "❌"
                    : typeof row[control.label] === "object"
                    ? JSON.stringify(row[control.label])
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
  );

  return (
    <div>
      {/* View mode toggle */}
      <div className="flex items-center gap-4 mb-4">
        <label>View Mode:</label>
        <select
          value={viewMode}
          onChange={(e) => {
            setViewMode(e.target.value);
            setCurrentIndex(0);
            setPage(0);
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="single">Single Card</option>
          <option value="grid">Grid View</option>
          <option value="table">Table View</option>
        </select>

        {/* Sort */}
        <label>Sort by:</label>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">None</option>
          {visibleControls.map((c) => (
            <option key={c.label} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Filter */}
        <label>Filter by:</label>
        <select
          value={filterField}
          onChange={(e) => {
            setFilterField(e.target.value);
            setFilterValue("");
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="">None</option>
          {visibleControls
            .filter((c) => c.controlType === "checkbox" || c.controlType)
            .map((c) => (
              <option key={c.label} value={c.label}>
                {c.label}
              </option>
            ))}
        </select>

        {filterField && (
          <>
            {controls.find((c) => c.label === filterField)?.controlType ===
            "checkbox" ? (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="">Select</option>
                <option value="true">✅ True</option>
                <option value="false">❌ False</option>
              </select>
            ) : (
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder={`Filter ${filterField}`}
                className="border px-2 py-1 rounded"
              />
            )}
          </>
        )}
      </div>

      {/* Render based on selected view mode */}
      {viewMode === "single"
        ? renderSingleCard()
        : viewMode === "grid"
        ? renderGridView()
        : renderTableView()}
      {/* For brevity, omitted here */}
      <p style={{ fontStyle: "italic", marginTop: 20, color: "#6b7280" }}>
        (View Mode {viewMode})
      </p>
    </div>
  );
};

export default DynamicFormList;
