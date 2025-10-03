import React, { useState, useEffect } from 'react';
import { FaUsers, FaTools } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import MapComponent from '../../../components/Map/MapComponent';
import axios from 'axios';
import dashboardHeroImage from '/src/assets/citizendash.png'; // Corrected image path for consistency
import './OfficerDashboard.css';

const ichalkaranjiCenter = { lat: 16.7033, lng: 74.4685 };

const OfficerDashboard = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/bins', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBins(response.data.data);
      } catch (err) {
        setError('Failed to load bin data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, []);

  return (
    <div className="officer-dashboard-page container fade-in">
      <header 
        className="page-header"
        style={{ backgroundImage: `url(${dashboardHeroImage})` }}
      >
        <h1>Officer Dashboard</h1>
        <p>Oversee the city's sanitation operations from here.</p>
      </header>
      <div className="dashboard-grid">
        <div className="live-map-card card">
          <h3>Live Bin Map Overview</h3>
          <div className="officer-map-container">
            {loading && <p className="loading-text">Loading Map...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && (
              <MapComponent 
                center={ichalkaranjiCenter} 
                markers={bins} 
              />
            )}
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/officer/manage-workers" className="dashboard-card card">
            <FaUsers className="card-icon" />
            <h3>Manage Workers</h3>
            <p>Assign routes and monitor your workforce.</p>
          </Link>
          <Link to="/officer/update-bin" className="dashboard-card card">
            <FaTools className="card-icon" />
            <h3>Manage Bins</h3>
            <p>Add new smart bins or update existing ones.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;