import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../css/login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const { login, isAuthenticated } = useAuth(); // ✅ add isAuthenticated
  // ✅ Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setError(isError);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleSendOtp = async () => {
    if (!email.endsWith("@gmail.com")) {
      showMessage("Enter a valid Gmail", true);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login-otp`,
        { email }
      );
      if (res.data.success) {
        showMessage("OTP sent successfully");
        setStep(2);
      } else {
        showMessage(res.data.message, true);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Server error", true);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, otp }
      );
      if (res.data.success) {
        login(res.data.token, res.data.companies, res.data);
        showMessage("Login successful");
        setOtp("");
        navigate("/");
      } else {
        showMessage(res.data.message, true);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Server error", true);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>
        {message && (
          <div className={`alert ${error ? "alert-error" : "alert-success"}`}>
            {message}
          </div>
        )}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendOtp}>Send OTP</button>
          </>
        )}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp}>Verify & Login</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
