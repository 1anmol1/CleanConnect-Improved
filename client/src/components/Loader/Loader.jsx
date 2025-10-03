import React from 'react';
import './Loader.css';

const Loader = ({ text }) => {
  return (
    <div className="skeleton-container container">
      {/* This simulates the hero image header */}
      <div className="skeleton skeleton-header"></div>
      
      {/* This simulates content cards or a map area */}
      <div className="skeleton skeleton-content-main"></div>

      <div className="skeleton-content-grid">
        <div className="skeleton skeleton-content-side"></div>
        <div className="skeleton skeleton-content-side"></div>
      </div>
      
      <p className="skeleton-loading-text">{text || 'Loading...'}</p>
    </div>
  );
};

export default Loader;

