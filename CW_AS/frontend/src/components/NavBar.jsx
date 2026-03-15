import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isDashboardPage = path === '/dashboard';

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/dashboard">
        Alumni Platform
      </Link>
      
      <div className="navbar-content">
        <ul className="navbar-nav">
          {/* Show Home and 3 Menu Icons only on Dashboard */}
          {isDashboardPage && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  {/* <span className="nav-icon">🏠</span> Home */}
                  <span className="nav-icon"></span> Home
                </Link>
              </li>
              <li className="nav-item">
                <span className="nav-link">
                  {/* <span className="nav-icon">📁</span> Projects */}
                  <span className="nav-icon"></span> Degrees
                </span>
              </li>
              <li className="nav-item">
                <span className="nav-link">
                  {/* <span className="nav-icon">⚙️</span> Settings */}
                  <span className="nav-icon"></span> Settings
                </span>
              </li>
              <li className="nav-item">
                <span className="nav-link">
                  {/* <span className="nav-icon">🔔</span> Notifications */}
                  <span className="nav-icon"></span> Notifications
                </span>
              </li>
              <li className="nav-item">
                <span className="nav-link">
                  {/* <span className="nav-icon">🔔</span> Notifications */}
                  <span className="nav-icon"></span> Notifications
                </span>
              </li>
              <li className="nav-item">
                <span className="nav-link">
                  {/* <span className="nav-icon">🔔</span> Notifications */}
                  <span className="nav-icon"></span> Notifications
                </span>
              </li>
            </>
          )}
        </ul>
        
        <div className="navbar-actions">
          {/* Always show Sign In and Sign Out buttons */}
          <Link to="/login" className="btn-signin">
            Sign In
          </Link>
          {/* <Link to="/register" className="btn-signup">
            Sign Up
          </Link> */}
          <button 
            onClick={handleSignOut} 
            className="btn-signout"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
