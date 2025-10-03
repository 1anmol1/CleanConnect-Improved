import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import MapComponent from '../../../components/Map/MapComponent.jsx';
import './CitizenDashboard.css';

// Mock data for 10 dustbins in Kothrud, Pune
const mockBinsData = [
  { _id: "60d5f1c7b54764421b7156dc", binId: "KTD-001", area: "Kothrud", coordinates: [73.8041, 18.5074], fillLevel: 95 },
  { _id: "60d5f1c7b54764421b7156dd", binId: "KTD-002", area: "Kothrud", coordinates: [73.8012, 18.5099], fillLevel: 82 },
  { _id: "60d5f1c7b54764421b7156de", binId: "KTD-003", area: "Kothrud", coordinates: [73.7985, 18.5055], fillLevel: 75 },
  { _id: "60d5f1c7b54764421b7156df", binId: "KTD-004", area: "Kothrud", coordinates: [73.8088, 18.5123], fillLevel: 45 },
  { _id: "60d5f1c7b54764421b7156e0", binId: "KTD-005", area: "Kothrud", coordinates: [73.7921, 18.4988], fillLevel: 25 },
  { _id: "60d5f1c7b54764421b7156e1", binId: "KTD-006", area: "Kothrud", coordinates: [73.8115, 18.5021], fillLevel: 98 },
  { _id: "60d5f1c7b54764421b7156e2", binId: "KTD-007", area: "Kothrud", coordinates: [73.7889, 18.5145], fillLevel: 60 },
  { _id: "60d5f1c7b54764421b7156e3", binId: "KTD-008", area: "Kothrud", coordinates: [73.8050, 18.4965], fillLevel: 30 },
  { _id: "60d5f1c7b54764421b7156e4", binId: "KTD-009", area: "Kothrud", coordinates: [73.8155, 18.5085], fillLevel: 88 },
  { _id: "60d5f1c7b54764421b7156e5", binId: "KTD-010", area: "Kothrud", coordinates: [73.7953, 18.5112], fillLevel: 55 },
];

const getBinStatus = (fillLevel) => {
  if (fillLevel >= 90) return 'Full';
  if (fillLevel >= 70) return 'Half-Full';
  return 'Empty';
};

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const puneKothrudCoords = { lat: 18.5074, lng: 73.8041 };

  useEffect(() => {
    // In a real app, you would replace this with an API call
    setTimeout(() => {
      setBins(mockBinsData);
      setLoading(false);
    }, 500); // Simulate network delay
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
            markers={bins.map(bin => ({
              binId: bin.binId,
              location: { coordinates: [bin.coordinates[0], bin.coordinates[1]] },
              status: getBinStatus(bin.fillLevel),
              fillLevel: bin.fillLevel
            }))}
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
