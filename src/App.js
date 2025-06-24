/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import MenuRegistration from "./components/MenuRegistration";
import "./App.css";
import MenuRegistrationList from "./components/MenuRegistrationList";
import FormRenderer from "./components/FormRenderer";
import Backup from "./reusable/Backup";

function App() {
  return (
    // <Router>
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<div>Home Page or Dashboard</div>} />
        <Route path="/menuregistration" element={<MenuRegistration />} />
        <Route
          path="/menuregistrationList"
          element={<MenuRegistrationList />}
        />

        <Route path="/menuregistration/:id" element={<MenuRegistration />} />

        <Route path="/:bname" element={<FormRenderer />} />
        <Route path="/backup" element={<Backup />} />

        <Route
          path="/menuregistrationlist"
          element={<MenuRegistrationList />}
        />
      </Routes>
    </div>
    // </Router>
  );
}

export default App;
