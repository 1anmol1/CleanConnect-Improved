import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaHome, FaDirections } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MapComponent from '../../../components/Map/MapComponent';
import Loader from '../../../components/Loader/Loader';
import './WorkerNavigation.css';

const WorkerNavigation = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const location = useLocation();
  const { route, workerLocation } = location.state || {};

  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!route || route.length === 0) {
      toast.error("No route data found. Redirecting...");
      navigate('/worker/directions');
    } else {
      setLoading(false);
    }
  }, [route, navigate]);

  if (loading) {
    return <Loader text="Loading navigation checklist..." />;
  }

  const currentStop = route[currentStopIndex];
  const isLastStop = currentStopIndex === route.length - 1;

  // THE FIX: This function now generates the Google Maps URL for the entire remaining route
  const handleLaunchNavigation = () => {
    if (!workerLocation) {
        toast.error("Current location not available.");
        return;
    }

    // Start navigation from the worker's current location
    const origin = `${workerLocation.lat},${workerLocation.lng}`;
    
    // Include all REMAINING stops in the route
    const remainingStops = route.slice(currentStopIndex);
    const waypoints = remainingStops
      .map(stop => `${stop.location.coordinates[1]},${stop.location.coordinates[0]}`)
      .join('|');
      
    // The final destination is the last stop on the list
    const destination = `${remainingStops[remainingStops.length - 1].location.coordinates[1]},${remainingStops[remainingStops.length - 1].location.coordinates[0]}`;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    
    window.open(googleMapsUrl, '_blank');
  };

  const handleNextStop = () => {
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
        <h1>Live Route Checklist</h1>
        <p>Use the buttons below to navigate and track your progress.</p>
      </div>
      <div className="navigation-layout">
        <div className="nav-map-panel card">
          <MapComponent
            center={{ lat: currentStop.location.coordinates[1], lng: currentStop.location.coordinates[0] }}
            markers={[currentStop]}
            workerLocation={workerLocation}
            zoom={16}
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
            {/* The new, prominent navigation button */}
            <button className="btn-launch-nav" onClick={handleLaunchNavigation}>
              <FaDirections /> Open Navigation in Google Maps
            </button>
            
            {isLastStop ? (
              <button className="btn-complete-route" onClick={handleNextStop}>
                <FaCheck /> Mark Final Stop as Collected
              </button>
            ) : (
              <button className="btn-next-stop" onClick={handleNextStop}>
                Mark as Collected & View Next <FaArrowRight />
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
