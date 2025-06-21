import React, { useEffect, useState } from "react";

const getCurrentDateParts = () => {
  const now = new Date();
  return {
    YYYY: now.getFullYear(),
    MM: String(now.getMonth() + 1).padStart(2, "0"),
    DD: String(now.getDate()).padStart(2, "0"),
  };
};

const formatEntno = (template, lastNumber = 0, user = "ADMIN") => {
  const dateParts = getCurrentDateParts();
  let result = template;

  result = result.replace(/{YYYY}/g, dateParts.YYYY);
  result = result.replace(/{MM}/g, dateParts.MM);
  result = result.replace(/{DD}/g, dateParts.DD);
  result = result.replace(/{USER}/g, user);
  result = result.replace(/{RAND}/g, Math.floor(Math.random() * 10000));
  result = result.replace(/{#+}/g, (match) =>
    String(lastNumber + 1).padStart(match.length, "0")
  );

  return result;
};

const EntnoGenerator = ({
  value,
  onChange,
  lastNumber = 0,
  user = "ADMIN",
}) => {
  const [template, setTemplate] = useState(value || "");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const generated = formatEntno(template, lastNumber, user);
    setPreview(generated);
    onChange?.(generated, template);
  }, [template, lastNumber, user]);

  return (
    <>
      {/* <label>Entno Format:</label> */}
      <input
        type="text"
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        placeholder="e.g., INV-{YYYY}-{MM}-{####}"
        title="EntNo Format e.g., INV-{YYYY}-{MM}-{####}"
      />
      <div style={{ fontSize: "0.85em", color: "#555" }}>
        {/* Example: <strong>{preview}</strong> */}
      </div>
    </>
  );
};

export default EntnoGenerator;
