import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { FaListOl, FaRoute, FaSync, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MapComponent from '../../../components/Map/MapComponent.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import useWorkerLocation from '../../../hooks/useWorkerLocation.js';
import './Directions.css';

// Master list of all bins for the day. This list doesn't change on reload.
const initialBinsForRoute = [
    { _id: "60d5f1c7b54764421b7156e2", binId: "KTD-007", area: "Kothrud", location: { coordinates: [73.7889, 18.5145] }, fillLevel: 60, status: "Empty" },
    { _id: "60d5f1c7b54764421b7156dc", binId: "KTD-001", area: "Kothrud", location: { coordinates: [73.8041, 18.5074] }, fillLevel: 95, status: "Full" },
    { _id: "60d5f1c7b54764421b7156de", binId: "KTD-003", area: "Kothrud", location: { coordinates: [73.7985, 18.5055] }, fillLevel: 75, status: "Half-Full" },
    { _id: "60d5f1c7b54764421b7156e1", binId: "KTD-006", area: "Kothrud", location: { coordinates: [73.8115, 18.5021] }, fillLevel: 98, status: "Full" },
    { _id: "60d5f1c7b54764421b7156dd", binId: "KTD-002", area: "Kothrud", location: { coordinates: [73.8012, 18.5099] }, fillLevel: 82, status: "Half-Full" },
    { _id: "60d5f1c7b54764421b7156e5", binId: "KTD-010", area: "Kothrud", location: { coordinates: [73.7953, 18.5112] }, fillLevel: 55, status: "Empty" },
    { _id: "60d5f1c7b54764421b7156e4", binId: "KTD-009", area: "Kothrud", location: { coordinates: [73.8155, 18.5085] }, fillLevel: 88, status: "Half-Full" },
];

const Directions = () => {
  const navigate = useNavigate();
  const { location: workerLocation, loading: locationLoading } = useWorkerLocation();
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 18.5074, lng: 73.8041 });
  const [routeSummary, setRouteSummary] = useState('');
  const [routePolyline, setRoutePolyline] = useState([]);
  const [currentBins, setCurrentBins] = useState(initialBinsForRoute);
  const [binsToDelete, setBinsToDelete] = useState([]);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

  // This function now contains all the optimization logic.
  const runRouteOptimization = () => {
    if (!workerLocation) {
      toast.warn("Waiting for your current location to optimize route.");
      return;
    }
    if (currentBins.length < 2) {
      toast.warn("At least two bins are required to generate a route.");
      // If there are no bins, clear any existing route
      setOptimizedRoute({ stops: [] });
      setRouteSummary(`Not enough bins to generate a route.`);
      return;
    }
    setIsOptimizing(true);
    
    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = currentBins.map(bin => ({
      location: { lat: bin.location.coordinates[1], lng: bin.location.coordinates[0] },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: workerLocation,
        destination: workerLocation,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const route = result.routes[0];
          const orderedStops = route.waypoint_order.map(i => currentBins[i]);
          
          let totalDistance = 0, totalDuration = 0;
          route.legs.forEach(leg => { totalDistance += leg.distance.value; totalDuration += leg.duration.value; });

          setRouteSummary(`Optimized Route: ${orderedStops.length} stops, ${(totalDistance / 1000).toFixed(1)} km, ~${Math.round(totalDuration / 60)} min.`);
          setRoutePolyline(route.overview_path);
          setOptimizedRoute({ stops: orderedStops });
          setMapCenter(workerLocation);
        } else {
          toast.error("Failed to generate route: " + status);
        }
        setIsOptimizing(false);
      }
    );
  };

  // NEW: This useEffect triggers the optimization automatically when the page loads
  // or when the list of bins changes (after a deletion).
  useEffect(() => {
    if (isLoaded && workerLocation) {
      runRouteOptimization();
    }
  }, [isLoaded, workerLocation, currentBins]); // Dependency array ensures it runs at the right time

  const toggleStageForDeletion = (binId) => {
    setBinsToDelete(prev => prev.includes(binId) ? prev.filter(id => id !== binId) : [...prev, binId]);
  };
  
  const handleConfirmDeletion = () => {
    const remainingBins = currentBins.filter(bin => !binsToDelete.includes(bin._id));
    setBinsToDelete([]);
    setOptimizedRoute(null); // Clear the old route
    setCurrentBins(remainingBins); // This state change will trigger the useEffect to re-optimize
    toast.success(`${binsToDelete.length} bin(s) removed. Re-optimizing route...`);
  };

  const handleStartRoute = () => {
    if (optimizedRoute) {
      navigate('/worker/navigation', { state: { route: optimizedRoute.stops, workerLocation } });
    }
  };

  // Show a loader until everything is ready and the first route is calculated.
  if (!isLoaded || locationLoading || !optimizedRoute || isOptimizing) {
    return <Loader text={isOptimizing ? "Optimizing route..." : "Generating your optimized route for today..."} />;
  }

  // Main view with map and list
  return (
    <div className="directions-page container fade-in">
      <header className="page-header">
        <h1>Today's Optimized Route</h1>
        <p className="route-summary">{routeSummary}</p>
      </header>

      <div className="directions-layout">
        <div className="map-panel card">
          <MapComponent 
            center={mapCenter} 
            markers={optimizedRoute.stops} 
            routeCoordinates={routePolyline} 
            workerLocation={workerLocation} 
          />
        </div>
        <div className="route-list-panel card">
          <div className="route-list-header">
            <h3><FaListOl /> Collection Stops ({optimizedRoute.stops.length})</h3>
            <div className="route-buttons">
              {binsToDelete.length > 0 && (
                <button onClick={handleConfirmDeletion} className="btn btn-danger regenerate-btn">
                  <FaCheckCircle /> Confirm Deletions ({binsToDelete.length})
                </button>
              )}
               <button onClick={runRouteOptimization} className="btn btn-secondary regenerate-btn">
                    <FaSync /> Regenerate
                </button>
              <button onClick={handleStartRoute} className="btn btn-primary start-route-btn">
                <FaRoute /> Start Route
              </button>
            </div>
          </div>
          <ul className="route-list">
            {optimizedRoute.stops.map((stop, index) => (
              <li 
                key={stop.binId} 
                className={`route-item ${binsToDelete.includes(stop._id) ? 'marked-for-deletion' : ''}`}
              >
                <div className="route-number">{index + 1}</div>
                <div className="route-details"><strong>Bin ID: {stop.binId}</strong><span>{stop.area}</span></div>
                <span className={`route-status status-${stop.status.toLowerCase()}`}>{stop.status}</span>
                <button onClick={() => toggleStageForDeletion(stop._id)} className="btn-delete-bin">
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Directions;