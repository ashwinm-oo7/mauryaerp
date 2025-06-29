import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/home.css";
import { FaDatabase, FaChartLine, FaLock } from "react-icons/fa";

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-wrapper">
      <div className="home-container">
        <h1>Welcome to Smart ERP Portal</h1>
        <p className="sub-text">
          Manage your business operations with confidence and clarity.
        </p>

        {!isAuthenticated && (
          <Link
            to="/dedfvudeusb*9-{uhiuiytredcfvghjgfqsrdscfsfvssrtd"
            className="login-button"
          >
            Login to continue
          </Link>
        )}

        <div className="features">
          <div className="feature-card">
            <FaDatabase className="icon" />
            <h3>Modular Database Access</h3>
            <p>Select and manage dynamic databases per user/role securely.</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="icon" />
            <h3>Custom Form Workflows</h3>
            <p>Build menus and forms dynamically from centralized config.</p>
          </div>
          <div className="feature-card">
            <FaLock className="icon" />
            <h3>Secure Login with OTP</h3>
            <p>Gmail-based login with OTP verification and admin approval.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
