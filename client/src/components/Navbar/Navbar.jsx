import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
// Import all necessary icons
import { 
    FaBars, 
    FaTimes, 
    FaUserCircle, 
    FaBell, 
    FaQrcode, 
    FaPlus, 
    FaUsersCog 
} from 'react-icons/fa';
import { BsTrashFill } from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth.js';
import QrScannerModal from '../../components/Modals/QrScannerModal.jsx';
import logo from '../../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef(null);

  const { user, logout } = useAuth();
  const navRef = useRef();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    setIsActionsMenuOpen(false);
    logout();
  };

  // Effect to handle closing both menus on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile hamburger menu
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMobileMenu();
      }
      // Close officer's '+' actions menu
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target) && !event.target.closest('.officer-actions-btn')) {
        setIsActionsMenuOpen(false);
      }
    };
    if (isMobileMenuOpen || isActionsMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isActionsMenuOpen]);

  // This function contains the complete links for all roles
  const getNavLinks = () => {
    if (!user) return [];
    
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
          { title: 'Report Issue', path: '/worker/new-complaint' },
          { title: 'Notifications', path: '/worker/notifications' },
        ];
      case 'Officer':
        // "Manage Workers" is now in the '+' menu, not the main nav links
        return [
          { title: 'Dashboard', path: '/officer/dashboard' },
          { title: 'Manage Complaints', path: '/officer/complaints' },
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
  const profileLink = user && user.role ? `/${user.role.toLowerCase()}/profile` : '/login';

  return (
    <>
      <nav className="navbar" ref={navRef}>
        <div className="navbar-container container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img src={logo} alt="Logo" className="navbar-main-logo" />
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
                {user.role === 'Citizen' && (<button onClick={() => setIsScannerOpen(true)} className="nav-link-icon qr-scan-btn" title="Scan Bin QR Code"><FaQrcode /></button>)}
                {isBellVisible && notificationLink && (<NavLink to={notificationLink.path} className="nav-link-icon notification-bell"><FaBell /></NavLink>)}
                
                {user.role === 'Officer' && (
                  <div className="officer-actions-container" ref={actionsMenuRef}>
                    <button onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)} className="officer-actions-btn" title="Quick Actions">
                      {isActionsMenuOpen ? <FaTimes /> : <FaPlus />}
                    </button>
                    <div className={`officer-actions-menu ${isActionsMenuOpen ? 'open' : ''}`}>
                      <NavLink to="/officer/manage-workers" onClick={() => setIsActionsMenuOpen(false)}>
                        <FaUsersCog /> Add or Manage Workers
                      </NavLink>
                      <NavLink to="/officer/update-bin" onClick={() => setIsActionsMenuOpen(false)}>
                        <BsTrashFill /> Add New Bin
                      </NavLink>
                    </div>
                  </div>
                )}

                <div className="user-info">
                  <NavLink to={profileLink} className="user-profile-link"><FaUserCircle /><span>{user.name}</span></NavLink>
                  <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
              </>
            ) : (
              <Link to="/login" onClick={closeMobileMenu}><button className="btn btn-primary">Login / Register</button></Link>
            )}
            <div className="menu-icon" onClick={toggleMobileMenu}>{isMobileMenuOpen ? <FaTimes /> : <FaBars />}</div>
          </div>

          <div className={`nav-menu-mobile-container ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul className="nav-menu-mobile">
              {user && ( <li className="nav-item nav-item-profile"><NavLink to={profileLink} className="nav-link" onClick={closeMobileMenu}>Profile</NavLink></li> )}
              {allLinks.map((link) => {
                if (isBellVisible && link.title === 'Notifications') { return null; }
                return ( <li className="nav-item" key={link.title}><NavLink to={link.path} className="nav-link" onClick={closeMobileMenu}>{link.title}</NavLink></li> );
              })}
              {user ? ( <li className="nav-item nav-item-logout"><button onClick={handleLogout} className="logout-button">Logout</button></li>
              ) : ( <li className="nav-item nav-item-login"><Link to="/login" onClick={closeMobileMenu}><button className="btn btn-primary btn-small">Login / Register</button></Link></li> )}
            </ul>
          </div>
        </div>
      </nav>
      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
};

export default Navbar;

