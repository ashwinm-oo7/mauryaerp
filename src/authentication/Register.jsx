import React, { useState } from "react";
import axios from "axios";
import "../css/Register.css";
import { Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.REACT_APP_API_URL;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendOtp = async () => {
    setError("");
    if (!validateEmail(email)) {
      return setError("Please enter a valid Gmail address.");
    }
    try {
      setLoading(true);
      const res = await axios.post(`${apiBase}/auth/send-otp`, { email });
      if (res.data.success) setOtpSent(true);
      else setError(res.data.message || "Failed to send OTP.");
    } catch (err) {
      setError("Something went wrong while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    if (!otp.trim()) return setError("OTP is required.");
    try {
      setLoading(true);
      const res = await axios.post(`${apiBase}/auth/verify-otp`, {
        email,
        otp,
      });
      if (res.data.success) setSubmitted(true);
      else setError(res.data.message || "Invalid OTP.");
    } catch (err) {
      setError("Something went wrong during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {!submitted ? (
        <div className="register-card">
          <h2>Register</h2>
          {error && <p className="error-text">{error}</p>}
          <input
            type="email"
            placeholder="Enter Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent || loading}
          />
          {!otpSent ? (
            <button onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <button onClick={handleVerify} disabled={loading}>
                {loading ? "Verifying..." : "Submit"}
              </button>
            </>
          )}
          <Link
            to="/dedfvudeusb*9-{uhiuiytredcfvghjgfqsrdscfsfvssrtd"
            className="header__dropdown-link"
          >
            Login
          </Link>
        </div>
      ) : (
        <div className="confirmation-message">
          <h3>Thank you for registering!</h3>
          <p>You’ll receive an email after admin approval is complete.</p>
        </div>
      )}
    </div>
  );
};

export default Register;
