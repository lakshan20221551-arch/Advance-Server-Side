import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate(); 

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", {
        email,
        password,
      });

      setMessage("Registration Successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login"); 
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="card">
    <div className="auth-card">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="lakshan.20221551@iit.ac.lk"
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
        <button type="submit" className="auth-btn register-btn">Create Account</button>
      </form>
      {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
      {error && <p className="message">{error}</p>}
    </div>
    </div>
  );
};

export default Register;