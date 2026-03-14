import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate(); 

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/auth/forget-password", {
        email,
        password,
      });

      setMessage("Reset Password Successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login"); 
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.error || "Reset Password Failed");
    }
  };

  return (
    <div className="card">
    <div className="auth-card">
      <h2>Forget Password</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // placeholder="lakshan.20221551@iit.ac.lk"
            required
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-btn register-btn">Reset Password</button>
      </form>
      {message && <p className="message success">{message}</p>}
    </div>
    </div>
  );
};

export default ForgetPassword;