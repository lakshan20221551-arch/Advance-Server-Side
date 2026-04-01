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
import Licenses from './pages/Licenses';
import ShortCourses from './pages/ShortCourses';
import EmployementHistory from './pages/EmployementHistory';
import Bid from './pages/Bid';
import Home from './pages/Home';

import Developer from './pages/Developer';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/degree" element={<Degree />} />
        <Route path="/certificate" element={<Certificates />} />
        <Route path="/license" element={<Licenses />} />
        <Route path="/short-courses" element={<ShortCourses />} />
        <Route path="/employment" element={<EmployementHistory />} />
        <Route path="/bidding" element={<Bid />} />
        <Route path="/developer" element={<Developer />} />
      </Routes>
    </>
  );
}

export default App;
