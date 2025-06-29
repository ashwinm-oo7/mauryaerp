/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import MenuRegistration from "./components/MenuRegistration";
import "./App.css";
import MenuRegistrationList from "./components/MenuRegistrationList";
import FormRenderer from "./components/FormRenderer";
import Backup from "./reusable/Backup";
import Register from "./authentication/Register";
import AdminPanel from "./admin/AdminPanel";
import Login from "./authentication/Login";
import PrivateRoute from "./context/PrivateRoute";
import HomePage from "./components/HomePage";

function App() {
  useEffect(() => {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, []);

  return (
    // <Router>
    <div className="App">
      <Header />
      <Routes>
        <Route
          path="/dedfvudeusb*9-{uhiuiytredcfvghjgfqsrdscfsfvssrtd"
          element={<Login />}
        />
        <Route path="/register" element={<Register />} />

        {/* Private routes below */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/menuregistration"
          element={
            <PrivateRoute>
              <MenuRegistration />
            </PrivateRoute>
          }
        />
        <Route
          path="/menuregistrationlist"
          element={
            <PrivateRoute>
              <MenuRegistrationList />
            </PrivateRoute>
          }
        />
        <Route
          path="/menuregistration/:id"
          element={
            <PrivateRoute>
              <MenuRegistration />
            </PrivateRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <PrivateRoute>
              <Backup />
            </PrivateRoute>
          }
        />
        <Route
          path="/:bname"
          element={
            <PrivateRoute>
              <FormRenderer />
            </PrivateRoute>
          }
        />
        <Route
          path="/dedfvudegfsfauhiuiytredcfvghjgfqsrdscfsfvssrtd"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
    // </Router>
  );
}

export default App;
