import React from "react";
import { useParams } from "react-router-dom";

import SizeMaster from "../forms/SizeMaster.js";
import QualityMaster from "../forms/QualityMaster.js";
import CategoryMaster from "../forms/CategoryMaster.js";

// Step 2: Map bname to components
const formMap = {
  "Size-Master": SizeMaster, // Note: key has dash instead of space
  "Quality-Master": QualityMaster,
  "Category-Master": CategoryMaster,
};

const FormRenderer = () => {
  const { bname } = useParams();
  const decodedBname = bname.replace(/-/g, " "); // 👈 Replace - with space
  // const FormComponent = formMap[decodedBname];
  const FormComponent = formMap[bname];

  if (!FormComponent) {
    return <div style={{ padding: 20 }}>❌ Page not found: {decodedBname}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">{decodedBname} Form</h2>
      <FormComponent bname={decodedBname} /> {/* Pass to form */}
    </div>
  );
};

export default FormRenderer;
