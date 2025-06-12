// src/components/GlobalLoader.js
import React, { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";
import "../css/GlobalLoader.css"; // You'll define CSS in next step

const GlobalLoader = () => {
  const { isLoading } = useContext(LoadingContext);

  if (!isLoading) return null;

  return (
    <div className="global-loader-backdrop">
      <div className="global-loader-circle" />
      {/* <div className="global-loader-text">ERP Loading...</div> */}
    </div>
  );
};

export default GlobalLoader;
