import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <span className="logo-icon"></span>
          <span className="logo-text">GameHub</span>
        </div>
      </div>
      <div className="navbar-right">
        <div className="user-profile" ref={dropdownRef}>
          <div className="profile-info">
            <span className="user-email">{currentUser.email}</span>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="profile-btn"
            >
              <span className="profile-icon">👤</span>
            </button>
          </div>
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <span className="dropdown-email">{currentUser.email}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 