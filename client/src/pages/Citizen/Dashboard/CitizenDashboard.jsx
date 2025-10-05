import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import MapComponent from '../../../components/Map/MapComponent.jsx';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const puneKothrudCoords = { lat: 18.5074, lng: 73.8041 };

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/bins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // THE FIX: Filter the results to only include smart bins for map display.
        const smartBins = data.data.filter(bin => bin.isSmartBin);
        setBins(smartBins || []);
      } catch (err) {
        console.error("Failed to fetch bins:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBins();
    const intervalId = setInterval(fetchBins, 15000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <Loader text="Loading nearby bin data..." />;

  return (
    <div className="citizen-dashboard container fade-in">
      <header className="page-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Here's a live overview of smart bins in your area.</p>
      </header>
      <div className="dashboard-content card">
        <h3><FaMapMarkerAlt /> Kothrud Area Bin Status</h3>
        <div className="map-wrapper" style={{ height: '500px', width: '100%' }}>
          <MapComponent
            center={puneKothrudCoords}
            markers={bins} // This now only contains smart bins
          />
        </div>
      </div>
       <div className="dashboard-actions">
        <Link to="/citizen/report" className="btn btn-primary report-button">
          <FaExclamationTriangle /> Report an Issue
        </Link>
      </div>
    </div>
  );
};

export default CitizenDashboard;

