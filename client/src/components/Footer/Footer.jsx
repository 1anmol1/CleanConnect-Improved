import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-section about">
          <h3 className="footer-logo">CleanConnect</h3>
          <p>
            Smart solutions for a cleaner, more sustainable future, right here in Pune and beyond.
          </p>
        </div>
        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/citizen/dashboard">Citizen Portal</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div className="footer-section social">
          <h4>Credits</h4>
          <p style={{ marginTop: '10px' }}>
            Project by: <a href="https://anmol-patil-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', textDecoration: 'none' }}>Anmol Patil</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CleanConnect. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;