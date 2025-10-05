import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
// 1. IMPORT THE NEW QR CODE ICON
import { FaBars, FaTimes, FaUserCircle, FaBell, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth.js';
// 2. IMPORT THE SCANNER MODAL (you will create this component)
import QrScannerModal from '../../components/Modals/QrScannerModal.jsx';
import logo from '../../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // 3. ADD STATE TO CONTROL THE SCANNER MODAL
  const [isScannerOpen, setIsScannerOpen] = useState(false);
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

  // This function remains unchanged
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
  const desktopNavLinks = allLinks.filter(link => link.title !== 'Notifications');
  const notificationLink = allLinks.find(link => link.title === 'Notifications');
  const isBellVisible = user && (user.role === 'Citizen' || user.role === 'Worker');
  const profileLink = user ? `/${user.role.toLowerCase()}/profile` : '/login';

  return (
    // We use a React Fragment to render the modal as a sibling to the nav
    <>
      <nav className="navbar" ref={navRef}>
        <div className="navbar-container container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <img src={logo} alt="CleanConnect Logo" className="navbar-main-logo" />
            <div className="logo-text">
              <span className="project-name">CleanConnect</span>
              <span className="tagline">Smart Sanitation Portal</span>
            </div>
          </Link>

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
                {/* 4. ADD THE QR SCANNER BUTTON */}
                {/* It will only render if the user is a Citizen */}
                {user.role === 'Citizen' && (
                  <button onClick={() => setIsScannerOpen(true)} className="nav-link-icon qr-scan-btn" title="Scan Bin QR Code">
                    <FaQrcode />
                  </button>
                )}
                
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

          <div className={`nav-menu-mobile-container ${isOpen ? 'active' : ''}`}>
            {/* The mobile menu dropdown remains completely unchanged */}
            <ul className="nav-menu-mobile">
              {user && ( <li className="nav-item nav-item-profile"><NavLink to={profileLink} className="nav-link" onClick={closeMenu}>Profile</NavLink></li> )}
              {allLinks.map((link) => {
                if (isBellVisible && link.title === 'Notifications') { return null; }
                return ( <li className="nav-item" key={link.title}><NavLink to={link.path} className="nav-link" onClick={closeMenu}>{link.title}</NavLink></li> );
              })}
              {user ? ( <li className="nav-item nav-item-logout"><button onClick={handleLogout} className="logout-button">Logout</button></li>
              ) : ( <li className="nav-item nav-item-login"><Link to="/login" onClick={closeMenu}><button className="btn btn-primary btn-small">Login / Register</button></Link></li> )}
            </ul>
          </div>
        </div>
      </nav>
      
      {/* 5. RENDER THE SCANNER MODAL */}
      {/* It will only be visible when isScannerOpen is true */}
      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
};

export default Navbar;