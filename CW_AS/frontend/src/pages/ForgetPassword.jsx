import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      // Calling the correct backend route: /forgot-password
      const response = await axios.post("http://localhost:3000/api/auth/forgot-password", {
        email,
      });

      setMessage("If that email matches an account, a reset link will be sent shortly. Please check your inbox.");

    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request");
    }
  };

  return (
    <div className="card">
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <p className="auth-subtitle">Enter your email to receive a password reset link.</p>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-btn register-btn">Send Reset Link</button>
      </form>
      {message && <p className="message success">{message}</p>}
      {error && <p className="message error" style={{color: 'red'}}>{error}</p>}
    </div>
    </div>
  );
};

export default ForgetPassword;
