import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AdminRoute = ({ children }) => {
  const { power } = useAuth();

  return power ? children : <Navigate to="/" />;
};

export default AdminRoute;
