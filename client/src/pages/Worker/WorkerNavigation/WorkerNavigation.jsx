import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaHome } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MapComponent from '../../../components/Map/MapComponent';
import Loader from '../../../components/Loader/Loader';
import './WorkerNavigation.css';

const WorkerNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { route, workerLocation } = location.state || {}; // Get data from navigation state

  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no route data is passed (e.g., user reloads the page), redirect back.
    if (!route || route.length === 0) {
      toast.error("No route data found. Redirecting to route planner.");
      navigate('/worker/directions');
    } else {
      setLoading(false);
    }
  }, [route, navigate]);

  if (loading) {
    return <Loader text="Loading route checklist..." />;
  }

  const currentStop = route[currentStopIndex];
  const isLastStop = currentStopIndex === route.length - 1;

  const handleNextStop = () => {
    // In a real app, you would send an API call here to update the bin's status
    toast.info(`Marked Bin ${currentStop.binId} as collected.`);
    
    if (!isLastStop) {
      setCurrentStopIndex(prevIndex => prevIndex + 1);
    } else {
      toast.success("Route completed successfully!");
      navigate('/worker/dashboard');
    }
  };

  return (
    <div className="worker-navigation-page container">
      <div className="navigation-header">
        <h1>Route Progress</h1>
        <p>Mark bins as collected after visiting them using your navigation app.</p>
      </div>
      <div className="navigation-layout">
        <div className="nav-map-panel card">
          <MapComponent
            center={{
              lat: currentStop.location.coordinates[1],
              lng: currentStop.location.coordinates[0],
            }}
            markers={[currentStop]} // Only show the current stop marker
            workerLocation={workerLocation} // Show worker's initial location for context
            zoom={16} // Zoom in closer on the target bin
          />
        </div>
        <div className="nav-details-panel card">
          <div className="stop-info">
            <span className="stop-counter">Next Stop: {currentStopIndex + 1} of {route.length}</span>
            <h2>Bin ID: {currentStop.binId}</h2>
            <p>Area: {currentStop.area}</p>
            <div className={`status-pill status-${currentStop.status.toLowerCase()}`}>
              {currentStop.status} ({currentStop.fillLevel}%)
            </div>
          </div>
          <div className="nav-actions">
            {isLastStop ? (
              <button className="btn-complete-route" onClick={handleNextStop}>
                <FaCheck /> Mark Final Stop as Collected
              </button>
            ) : (
              <button className="btn-next-stop" onClick={handleNextStop}>
                Mark as Collected & View Next Stop <FaArrowRight />
              </button>
            )}
            <button className="btn-end-route" onClick={() => navigate('/worker/dashboard')}>
              <FaHome /> End Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerNavigation;  