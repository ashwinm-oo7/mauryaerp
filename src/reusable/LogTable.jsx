import React, { useState } from "react";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ fix compatibility issue
import "../css/LogTable.css";

const LogTable = ({
  data = [],
  columns = [],
  title = "Logs",
  pageSize = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportCSV = () => {
    const csv = Papa.unparse(
      data.map((row, i) =>
        Object.fromEntries(
          columns.map((col) => [col.header, formatExport(col.accessor(row, i))])
        )
      )
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${title.replace(/\s+/g, "_")}.csv`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 14, 10);
    autoTable(doc, {
      startY: 16,
      head: [columns.map((col) => col.header)],
      body: data.map((row, i) =>
        columns.map((col) => {
          const val = col.accessor(row, i);
          return typeof val === "object"
            ? JSON.stringify(val, null, 2)
            : String(val);
        })
      ),
      styles: { fontSize: 8, cellWidth: "wrap" },
    });
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  };

  const formatExport = (value) =>
    typeof value === "object" ? JSON.stringify(value, null, 2) : value;

  return (
    <div className="log-table-wrapper">
      <div className="log-table-header">
        <h3>{title}</h3>
        <div className="export-buttons">
          <button onClick={exportCSV}>📄 Export CSV</button>
          <button onClick={exportPDF}>📘 Export PDF</button>
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="log-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={row._id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="log-cell">
                      {col.accessor(
                        row,
                        (currentPage - 1) * pageSize + rowIndex
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>No logs to display.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ◀
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default LogTable;
