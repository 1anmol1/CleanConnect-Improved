import React from 'react';
import { FaRoute, FaExclamationCircle, FaCheckDouble } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import dashboardHeroImage from '/src/assets/workerdash.png'; // Import the local hero image
import './WorkerDashboard.css';

const WorkerDashboard = () => {
  return (
    <div className="worker-dashboard-page container fade-in">
      <header 
        className="page-header"
        style={{ backgroundImage: `url(${dashboardHeroImage})` }} // Apply image as inline style
      >
        <h1>Worker Dashboard</h1>
        <p>Welcome, Ramesh! Here's your summary for today.</p>
      </header>
      <div className="dashboard-grid">
        <Link to="/worker/directions" className="dashboard-card card">
          <FaRoute className="card-icon" />
          <h3>View Assigned Route</h3>
          <p>Check your optimized collection route for the day.</p>
        </Link>
        <Link to="/worker/new-complaint" className="dashboard-card card">
          <FaExclamationCircle className="card-icon" />
          <h3>Report a New Issue</h3>
          <p>Report roadblocks, damaged bins, or other problems.</p>
        </Link>
        <Link to="/worker/resolutions" className="dashboard-card card">
          <FaCheckDouble className="card-icon" />
          <h3>View Resolutions</h3>
          <p>Check and resolve tasks assigned by your officer.</p>
        </Link>
      </div>
    </div>
  );
};

export default WorkerDashboard;

