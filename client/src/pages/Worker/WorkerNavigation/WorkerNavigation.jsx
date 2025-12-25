import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Import axios
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

  // This useEffect checks if route data exists
  useEffect(() => {
    if (!route || route.length === 0) {
      toast.error("No route data found. Redirecting...");
      navigate('/worker/directions');
    } else {
      setLoading(false);
    }
  }, [route, navigate]);


  // --- THIS IS THE NEW LOGIC FOR LIVE LOCATION TRACKING ---
  useEffect(() => {
    // This function sends the worker's current location to the backend
    const updateLocation = (position) => {
      const { latitude, longitude } = position.coords;
      const token = localStorage.getItem('token');
      
      axios.put('/users/live-location', {
        lat: latitude,
        lng: longitude
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(error => {
        // We log this error silently to not bother the worker with notifications
        console.error("Failed to send live location update:", error);
      });
    };

    // This function is called by the interval
    const sendLocationUpdate = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateLocation, (error) => {
          console.error("Geolocation error:", error.message);
        });
      }
    };

    // Set up an interval to send a location update every 30 seconds
    const intervalId = setInterval(sendLocationUpdate, 30000);

    // This is a crucial cleanup function. It runs when the worker navigates away
    // from this page, stopping the interval to save battery life.
    return () => clearInterval(intervalId);

  }, []); // The empty dependency array ensures this effect runs only once.
  // --- END OF LIVE TRACKING LOGIC ---


  if (loading) {
    return <Loader text="Loading navigation checklist..." />;
  }

  const currentStop = route[currentStopIndex];
  const isLastStop = currentStopIndex === route.length - 1;

  const handleLaunchNavigation = () => {
    if (!workerLocation) {
        toast.error("Current location not available.");
        return;
    }
    const origin = `${workerLocation.lat},${workerLocation.lng}`;
    const remainingStops = route.slice(currentStopIndex);
    const waypoints = remainingStops
      .map(stop => `${stop.location.coordinates[1]},${stop.location.coordinates[0]}`)
      .join('|');
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
            workerLocation={workerLocation} // This shows the worker's starting location
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