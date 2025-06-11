import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { MenuContext } from "../context/MenuContext";
// import DynamicForm from "../components/DynamicForm";
// import DynamicFormList from "./DynamicFormList";
import DynamicFormContainer from "./DynamicFormContainer";

const FormRenderer = () => {
  const { bname } = useParams();
  const decodedBname = bname.replace(/-/g, " ");
  const { saberpmenu = [] } = useContext(MenuContext);

  const formMeta = saberpmenu.find((form) => form.bname === decodedBname);

  if (!formMeta || !formMeta.controls?.length) {
    return (
      <div className="p-4 text-red-600">
        ❌ No form metadata found for <strong>{decodedBname}</strong>
      </div>
    );
  }
  console.log("formMeta", formMeta);
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">{decodedBname}</h2>
      {/* <DynamicForm formMeta={formMeta} />
      <DynamicFormList formMeta={formMeta} /> */}
      <DynamicFormContainer formMeta={formMeta} />
    </div>
  );
};

export default FormRenderer;
