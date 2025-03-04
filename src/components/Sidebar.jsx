import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaFileAlt, FaLink, FaExchangeAlt, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <aside className="sidebar">
      {/* Desktop version: visible on medium and larger screens */}
      <div className="sidebar-desktop">
        <div className="sidebar-logo">
          <h2>Your Logo</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/profiles">
                <FaUser className="sidebar-icon" />
                Profiles
              </Link>
            </li>
            <li>
              <Link to="/documents">
                <FaFileAlt className="sidebar-icon" />
                Document Library
              </Link>
            </li>
            <li>
              <Link to="/crm-integration">
                <FaLink className="sidebar-icon" />
                CRM Integration
              </Link>
            </li>
            <li>
              <Link to="/reconciliation">
                <FaExchangeAlt className="sidebar-icon" />
                Reconciliation
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile version: visible on small screens */}
      <div className="sidebar-mobile">
        <div className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="mobile-nav">
            <ul>
              <li>
                <Link to="/profiles" onClick={toggleMobileMenu}>
                  <FaUser className="sidebar-icon" />
                  Profiles
                </Link>
              </li>
              <li>
                <Link to="/documents" onClick={toggleMobileMenu}>
                  <FaFileAlt className="sidebar-icon" />
                  Document Library
                </Link>
              </li>
              <li>
                <Link to="/crm-integration" onClick={toggleMobileMenu}>
                  <FaLink className="sidebar-icon" />
                  CRM Integration
                </Link>
              </li>
              <li>
                <Link to="/reconciliation" onClick={toggleMobileMenu}>
                  <FaExchangeAlt className="sidebar-icon" />
                  Reconciliation
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

