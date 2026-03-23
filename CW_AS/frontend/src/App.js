import './App.css';
import Login from './pages/Login';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NavBar from './components/NavBar';
import ForgetPassword from './pages/ForgetPassword';
import Profile from './pages/Profile';
import Degree from './pages/Degree';
import Certificates from './pages/Certificates';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/degree" element={<Degree />} />
        <Route path="/certificate" element={<Certificates />} />
      </Routes>
    </>
  );
}

export default App;
