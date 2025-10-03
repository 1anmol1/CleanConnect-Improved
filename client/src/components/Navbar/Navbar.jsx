import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaBell } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth.js';
import logo from '../../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navRef = useRef();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNavLinks = () => {
    if (!user) { return []; }
    
    switch (user.role) {
      case 'Citizen':
        return [
          { title: 'Dashboard', path: '/citizen/dashboard' },
          { title: 'Report Issue', path: '/citizen/report' },
          { title: 'Rewards', path: '/citizen/rewards' },
          { title: 'Notifications', path: '/citizen/notifications' },
        ];
      case 'Worker':
        return [
          { title: 'Dashboard', path: '/worker/dashboard' },
          { title: 'My Route', path: '/worker/directions' },
          { title: 'Resolutions', path: '/worker/resolutions' },
          { title: 'Notifications', path: '/worker/notifications' },
        ];
      case 'Officer':
        return [
          { title: 'Dashboard', path: '/officer/dashboard' },
          { title: 'Manage Complaints', path: '/officer/complaints' },
          { title: 'Manage Workers', path: '/officer/manage-workers' },
          { title: 'Send Notification', path: '/officer/create-notification' },
        ];
      default:
        return [];
    }
  };

  const allLinks = getNavLinks();
  // Links for the main desktop navigation (excludes notification-related links)
  const desktopNavLinks = allLinks.filter(link => !link.title.includes('Notification'));
  // Find the specific notification link for the bell icon
  const notificationLink = allLinks.find(link => link.title === 'Notifications');
  
  // UPDATED: A flag to check if the bell icon should be visible outside the menu
  const isBellVisible = user && (user.role === 'Citizen' || user.role === 'Worker');

  const profileLink = user ? `/${user.role.toLowerCase()}/profile` : '/login';

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="CleanConnect Logo" className="navbar-main-logo" />
          <div className="logo-text">
            <span className="project-name">CleanConnect</span>
            <span className="tagline">Smart Sanitation Portal</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-menu-desktop">
          {desktopNavLinks.map((link) => (
            <li className="nav-item" key={link.title}>
              <NavLink to={link.path} className="nav-link">{link.title}</NavLink>
            </li>
          ))}
        </ul>

        <div className="header-actions">
          {user ? (
            <>
              {/* UPDATED: Bell icon is now here, rendered conditionally */}
              {isBellVisible && notificationLink && (
                <NavLink to={notificationLink.path} className="nav-link-icon notification-bell">
                  <FaBell />
                </NavLink>
              )}
              <div className="user-info">
                <NavLink to={profileLink} className="user-profile-link">
                  <FaUserCircle />
                  <span>{user.name}</span>
                </NavLink>
                <button onClick={handleLogout} className="btn btn-logout">Logout</button>
              </div>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu}>
              <button className="btn btn-primary">Login / Register</button>
            </Link>
          )}
          <div className="menu-icon" onClick={toggleMenu}>{isOpen ? <FaTimes /> : <FaBars />}</div>
        </div>

        {/* Mobile Menu Container */}
        <div className={`nav-menu-mobile-container ${isOpen ? 'active' : ''}`}>
          <ul className="nav-menu-mobile">
            {user && (
              <li className="nav-item nav-item-profile">
                <NavLink to={profileLink} className="nav-link" onClick={closeMenu}>Profile</NavLink>
              </li>
            )}
            
            {/* UPDATED: Logic to conditionally show links in mobile menu */}
            {allLinks.map((link) => {
              // For Citizens/Workers, hide the "Notifications" text link because the bell icon is already visible
              if (isBellVisible && link.title === 'Notifications') {
                return null;
              }
              // Render all other links
              return (
                <li className="nav-item" key={link.title}>
                  <NavLink to={link.path} className="nav-link" onClick={closeMenu}>
                    {link.title}
                  </NavLink>
                </li>
              );
            })}

            {user ? (
              <li className="nav-item nav-item-logout">
                <button onClick={handleLogout} className="logout-button">Logout</button>
              </li>
            ) : (
              <li className="nav-item nav-item-login">
                <Link to="/login" onClick={closeMenu}>
                  <button className="btn btn-primary btn-small">Login / Register</button>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

