// utils/exportUtils.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0] || {});
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((field) => JSON.stringify(row[field] ?? "")).join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const exportToPDF = (data, columns, filename) => {
  const doc = new jsPDF();
  const tableColumn = columns.map((col) => col.header);
  const tableRows = data.map((row) =>
    columns.map((col) => {
      const val = col.accessor(row);
      return typeof val === "string" ? val : JSON.stringify(val);
    })
  );

  doc.autoTable(tableColumn, tableRows);
  doc.save(`${filename}.pdf`);
};

export const applyOperationRules = (data, controls) => {
  const updatedData = { ...data };

  controls?.forEach((control) => {
    const rule = control.operationRule;
    if (
      rule &&
      updatedData.hasOwnProperty(rule.leftOperand) &&
      updatedData.hasOwnProperty(rule.rightOperand)
    ) {
      const left = parseFloat(updatedData[rule.leftOperand]);
      const right = parseFloat(updatedData[rule.rightOperand]);

      if (!isNaN(left) && !isNaN(right)) {
        let result = "";
        switch (rule.operator) {
          case "+":
            result = left + right;
            break;
          case "-":
            result = left - right;
            break;
          case "*":
            result = left * right;
            break;
          case "/":
            result = right !== 0 ? left / right : 0;
            break;
        }
        updatedData[control.label] = result;
      }
    }
  });

  return updatedData;
};
