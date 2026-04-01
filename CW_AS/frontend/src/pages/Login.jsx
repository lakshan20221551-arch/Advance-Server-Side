import {useState} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });
      
      localStorage.setItem("token", response.data.token);
      setMessage("Login Successful! Welcome " + response.data.user.email);
      setTimeout(() => {
        navigate("/dashboard"); 
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");  
    }
  };

  return (
    <div className="card">
    <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@iit.ac.lk"
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
        <div>
            <p>
             <Link to="/forget-password">Forgot Password?</Link>
            </p>
        </div>
        <div>
        <button type="submit" className="auth-btn">Sign In</button>
        </div>
        <div>
            <p>
            Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
      </form>
      {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
      {error && <p className="message">{error}</p>}
    </div>
    </div>
  );
};

export default Login;