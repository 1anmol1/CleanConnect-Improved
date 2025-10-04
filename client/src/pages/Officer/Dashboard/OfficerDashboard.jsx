import React, { useState, useEffect } from 'react';
import { FaUsers, FaTools, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js'; // Import useAuth to get user info
import MapComponent from '../../../components/Map/MapComponent';
import Loader from '../../../components/Loader/Loader'; // Use a loader for consistency
import dashboardHeroImage from '/src/assets/citizendash.png';
import './OfficerDashboard.css';

// 1. THE SAME MOCK DATA used in CitizenDashboard and Directions
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

// 2. THE SAME HELPER FUNCTIONS for consistency
const getBinStatus = (fillLevel) => {
  if (fillLevel >= 90) return 'Full';
  if (fillLevel >= 70) return 'Half-Full';
  return 'Empty';
};

const OfficerDashboard = () => {
  const { user } = useAuth(); // Get the logged-in officer's data
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Set the map center based on the logged-in officer's city, with a fallback
  const mapCenter = user?.city === 'Pune' 
    ? { lat: 18.5074, lng: 73.8041 } // Kothrud, Pune
    : { lat: 16.7033, lng: 74.4685 }; // Default fallback

  useEffect(() => {
    // 3. THE SAME DATA HANDLING LOGIC as the other dashboards
    // In a real app, this would be an API call. For now, we simulate it.
    setTimeout(() => {
        setBins(mockBinsData);
        setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <Loader text="Loading operational data..." />;
  }

  return (
    <div className="officer-dashboard-page container fade-in">
      <header 
        className="page-header"
        style={{ backgroundImage: `url(${dashboardHeroImage})` }}
      >
        <h1>Officer Dashboard ({user?.city})</h1>
        <p>Oversee your city's sanitation operations from here.</p>
      </header>
      <div className="dashboard-grid">
        <div className="live-map-card card">
          <h3><FaMapMarkerAlt /> Live Bin Map Overview</h3>
          <div className="officer-map-container">
            {/* 4. The MapComponent is now populated with the correct data structure */}
            <MapComponent 
              center={mapCenter} 
              markers={bins.map(bin => ({
                binId: bin.binId,
                location: { coordinates: [bin.coordinates[0], bin.coordinates[1]] },
                status: getBinStatus(bin.fillLevel),
                fillLevel: bin.fillLevel
              }))}
            />
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/officer/manage-workers" className="dashboard-card card">
            <FaUsers className="card-icon" />
            <h3>Manage Workers</h3>
            <p>View worker status and manage assignments.</p>
          </Link>
          <Link to="/officer/update-bin" className="dashboard-card card">
            <FaTools className="card-icon" />
            <h3>Manage Bins</h3>
            <p>Add new smart bins to the city network.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;