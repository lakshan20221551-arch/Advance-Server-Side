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
        {/* /* {isDashboardPage ||  * */}
          {/* ( */}
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  {/* <span className="nav-icon">🏠</span> Home */}
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
                <span className="nav-link">
                  {/* <span className="nav-icon">🔔</span> Notifications */}
                  <span className="nav-icon"></span> Employment
                </span>
              </li>
              <li className="nav-item">
                <span className="nav-link">
                  {/* <span className="nav-icon">🔔</span> Notifications */}
                  <span className="nav-icon"></span> Bidding
                </span>
              </li>
            </>
          {/* )} */}
        </ul>

        <div className="navbar-actions">
          <Link to="/profile" className="btn-signin" style={{ marginRight: '10px' }}>
            Profile
          </Link>
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
