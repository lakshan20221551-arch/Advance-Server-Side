import React from 'react'       
import axios from "axios";import { Link } from "react-router-dom";    
import { useNavigate } from 'react-router-dom'   
import { useEffect } from 'react';
import { useState } from 'react';   
const Dashboard = () => {
    const navigate = useNavigate(); 
    const token = localStorage.getItem("token");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/dashboard", {
        email,
        password,
      });

    //   setMessage("Registration Successful! Redirecting to login...");
      
    //   setTimeout(() => {
    //     navigate("/"); 
    //   }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Dashboard failed");
    }
  };
    if (!token) {
        navigate("/login");
    }
    return (
        <div>
            <h2>Dashboard</h2>
        </div>
    );
};  

export default Dashboard;