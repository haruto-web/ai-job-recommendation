import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation({ isLoggedIn, onLogin, onRegister, onLogout }) {
  return (
    <nav className="navigation">
      <ul className="navigation-list">
        <li className="navigation-item">
          <Link to="/" className="navigation-link">Home</Link>
        </li>
        <li className="navigation-item">
          <Link to="/about" className="navigation-link">About</Link>
        </li>
        {isLoggedIn && (
          <>
            <li className="navigation-item">
              <Link to="/jobs" className="navigation-link">Jobs</Link>
            </li>
            <li className="navigation-item">
              <Link to="/account" className="navigation-link">Account</Link>
            </li>
          </>
        )}
        <li className="navigation-item">
          {isLoggedIn ? (
            <button onClick={onLogout} className="navigation-button">Sign out</button>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="navigation-link">Login</Link>
              <Link to="/register" className="navigation-link">Register</Link>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
