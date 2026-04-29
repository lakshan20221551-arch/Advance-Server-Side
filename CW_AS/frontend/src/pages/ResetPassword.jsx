import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../App.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Hits the updated reset-password/:token endpoint
      const response = await axios.post(`http://localhost:3000/api/auth/reset-password/${token}`, {
        newPassword: password,
      });

      setMessage("Password successfully reset! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Create a new password for your account.</p>
        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button 
            type="submit" 
            className="auth-btn register-btn" 
            disabled={isLoading || message !== ""}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && <p className="message success" style={{color: 'green', marginTop: '10px'}}>{message}</p>}
        {error && <p className="message error" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
        
        <div style={{marginTop: '20px', textAlign: 'center'}}>
          <Link to="/login" style={{textDecoration: 'none', color: '#007bff'}}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
