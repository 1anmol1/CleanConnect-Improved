import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
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
  const [legPolyline, setLegPolyline] = useState([]);
  const [legSummary, setLegSummary] = useState('');
  const [isCalculating, setIsCalculating] = useState(true);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    if (!isLoaded || !route || route.length === 0) {
      if(!route) navigate('/worker/directions'); // Redirect if no data
      return;
    }

    const calculateLegRoute = (origin, destination) => {
      setIsCalculating(true);
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            const leg = result.routes[0].legs[0];
            setLegPolyline(result.routes[0].overview_path);
            setLegSummary(`Next: ${leg.distance.text}, approx. ${leg.duration.text}`);
          } else {
            toast.error(`Could not calculate route for this leg: ${status}`);
            setLegSummary('Could not calculate route.');
          }
          setIsCalculating(false);
        }
      );
    };

    const origin = currentStopIndex === 0 ? workerLocation : {
      lat: route[currentStopIndex - 1].location.coordinates[1],
      lng: route[currentStopIndex - 1].location.coordinates[0],
    };
    const destination = {
      lat: route[currentStopIndex].location.coordinates[1],
      lng: route[currentStopIndex].location.coordinates[0],
    };

    calculateLegRoute(origin, destination);

  }, [currentStopIndex, route, workerLocation, isLoaded, navigate]);

  if (!isLoaded || !route) {
    return <Loader text="Initializing navigation..." />;
  }

  const currentStop = route[currentStopIndex];
  const isLastStop = currentStopIndex === route.length - 1;

  const handleNextStop = () => {
    if (!isLastStop) {
      setCurrentStopIndex(prev => prev + 1);
    } else {
      toast.success("Route completed successfully!");
      navigate('/worker/dashboard');
    }
  };

  return (
    <div className="worker-navigation-page container">
      <div className="navigation-header">
        <h1>Live Navigation: {isCalculating ? 'Calculating...' : legSummary}</h1>
        <p>Follow the path to the next collection point.</p>
      </div>
      <div className="navigation-layout">
        <div className="nav-map-panel card">
          {isCalculating ? <Loader text="Updating map..." /> : (
            <MapComponent
              center={{ lat: currentStop.location.coordinates[1], lng: currentStop.location.coordinates[0] }}
              markers={[currentStop]}
              routeCoordinates={legPolyline}
              workerLocation={workerLocation} // Show worker's initial location
              zoom={16}
            />
          )}
        </div>
        <div className="nav-details-panel card">
          <div className="stop-info">
            <span className="stop-counter">Stop {currentStopIndex + 1} of {route.length}</span>
            <h2>Bin ID: {currentStop.binId}</h2>
            <p>Area: {currentStop.area}</p>
            <div className={`status-pill status-${currentStop.status.toLowerCase()}`}>
              {currentStop.status} ({currentStop.fillLevel}%)
            </div>
          </div>
          <div className="nav-actions">
            {isLastStop ? (
              <button className="btn-complete-route" onClick={handleNextStop} disabled={isCalculating}>
                <FaCheck /> Mark as Collected & Complete Route
              </button>
            ) : (
              <button className="btn-next-stop" onClick={handleNextStop} disabled={isCalculating}>
                Mark as Collected & Go to Next Stop <FaArrowRight />
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