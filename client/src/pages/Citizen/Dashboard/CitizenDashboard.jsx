import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import MapComponent from '../../../components/Map/MapComponent.jsx';
import './CitizenDashboard.css';

// This is our fallback mock data.
const mockBinsData = [
  { _id: "60d5f1c7b54764421b7156dc", binId: "PUNE-KTD-01", area: "Kothrud", coordinates: [73.8041, 18.5074], fillLevel: 95 },
  { _id: "60d5f1c7b54764421b7156dd", binId: "PUNE-KTD-02", area: "Kothrud", coordinates: [73.8012, 18.5099], fillLevel: 82 },
  { _id: "60d5f1c7b54764421b7156de", binId: "PUNE-KTD-03", area: "Kothrud", coordinates: [73.7985, 18.5055], fillLevel: 75 },
  { _id: "60d5f1c7b54764421b7156df", binId: "PUNE-KTD-04", area: "Kothrud", coordinates: [73.8088, 18.5123], fillLevel: 45 },
  { _id: "60d5f1c7b54764421b7156e0", binId: "PUNE-KTD-05", area: "Kothrud", coordinates: [73.7921, 18.4988], fillLevel: 25 },
  { _id: "60d5f1c7b54764421b7156e1", binId: "PUNE-KTD-06", area: "Kothrud", coordinates: [73.8115, 18.5021], fillLevel: 98 },
  { _id: "60d5f1c7b54764421b7156e2", binId: "PUNE-KTD-07", area: "Kothrud", coordinates: [73.7889, 18.5145], fillLevel: 60 },
  { _id: "60d5f1c7b54764421b7156e3", binId: "PUNE-KTD-08", area: "Kothrud", coordinates: [73.8050, 18.4965], fillLevel: 30 },
  { _id: "60d5f1c7b54764421b7156e4", binId: "PUNE-KTD-09", area: "Kothrud", coordinates: [73.8155, 18.5085], fillLevel: 88 },
  { _id: "60d5f1c7b54764421b7156e5", binId: "PUNE-KTD-10", area: "Kothrud", coordinates: [73.7953, 18.5112], fillLevel: 55 },
];

const getBinStatus = (fillLevel) => {
  if (fillLevel >= 90) return 'Full';
  if (fillLevel >= 70) return 'Half-Full';
  return 'Empty';
};

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState([]); // This will hold our merged data
  const [loading, setLoading] = useState(true);
  const puneKothrudCoords = { lat: 18.5074, lng: 73.8041 };

  // THE FIX: This useEffect now fetches AND merges the data
  useEffect(() => {
    const fetchAndMergeBins = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/bins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const realBins = data.data || [];
        
        // Create a lookup map for the real data for efficiency
        const realBinsMap = new Map(realBins.map(bin => [bin.binId, bin]));

        // Merge the mock data with the real data
        const mergedBins = mockBinsData.map(mockBin => {
          const realBinData = realBinsMap.get(mockBin.binId);
          if (realBinData) {
            // If a real bin exists (like PUNE-KTD-01), use its live data
            return {
              ...mockBin, // Keep mock location, area etc.
              fillLevel: realBinData.fillLevel, // Use LIVE fillLevel
              status: realBinData.status,       // Use LIVE status
            };
          }
          // Otherwise, just use the original mock bin
          return mockBin;
        });
        
        setBins(mergedBins);

      } catch (err) {
        console.error("Failed to fetch bins:", err);
        // If API fails, fall back to just the mock data so the page doesn't break
        setBins(mockBinsData);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMergeBins(); // Fetch immediately on load
    const intervalId = setInterval(fetchAndMergeBins, 15000); // And then poll every 15 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
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