import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isAuthPage = path === '/login' || path === '/register' || path === '/forget-password' || path === '/';
  const isAuthenticated = !!localStorage.getItem('token');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link className="navbar-brand" to={isAuthenticated ? "/dashboard" : "/login"}>
        ALUMNI PLATFORM
      </Link>

      <div className="navbar-content">
        <ul className="navbar-nav">
          {isAuthenticated && !isAuthPage && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  <span className="nav-icon"></span> Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/degree">
                  <span className="nav-icon"></span> Degrees
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/certificate">
                  <span className="nav-icon"></span> Certifications
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/license">
                  <span className="nav-icon"></span> Licenses
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/short-courses">
                  <span className="nav-icon"></span> Short Courses
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/employment">
                  <span className="nav-icon"></span> Employment History
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bidding">
                  <span className="nav-icon"></span> Bidding
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link className="nav-link" to="/developer">
                  <span className="nav-icon"></span> Developer
                </Link>
              </li> */}
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated && !isAuthPage ? (
            <>
              <Link to="/profile" className="btn-signin" style={{ marginRight: '10px' }}>
                Profile
              </Link>
              <button onClick={handleSignOut} className="btn-signout">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-signin" style={{ marginRight: '10px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-signout" style={{ background: '#ff4d4f' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
