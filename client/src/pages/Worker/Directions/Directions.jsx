import React, { useState, useEffect, useCallback } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { FaListOl, FaRoute, FaSync, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import MapComponent from '../../../components/Map/MapComponent.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import RouteOptimizationLoader from '../../../components/Loader/RouteOptimizationLoader.jsx'; // 1. Import the new animation loader
import useWorkerLocation from '../../../hooks/useWorkerLocation.js';
import dashboardHeroImage from '/src/assets/route.png';
import './Directions.css';

const Directions = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { location: workerLocation, loading: locationLoading } = useWorkerLocation();
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 18.5074, lng: 73.8041 });
  const [routeSummary, setRouteSummary] = useState('');
  const [routePolyline, setRoutePolyline] = useState([]);
  const [currentBins, setCurrentBins] = useState([]); 
  const [binsToDelete, setBinsToDelete] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // 2. NEW STATE: This controls whether to show the animation screen or the final map.
  const [showOptimizationScreen, setShowOptimizationScreen] = useState(true);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });
  
  const runRouteOptimization = useCallback(() => {
    if (!workerLocation || !isLoaded || currentBins.length === 0) return;

    if (currentBins.length < 2) {
      setOptimizedRoute({ stops: [] });
      setRouteSummary(`Not enough bins to generate a route.`);
      return;
    }
    // Set a different loading state here to show a different message
    setIsOptimizing(true); 
    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = currentBins.map(bin => ({ location: { lat: bin.location.coordinates[1], lng: bin.location.coordinates[0] }, stopover: true }));
    
    directionsService.route({ origin: workerLocation, destination: workerLocation, waypoints, optimizeWaypoints: true, travelMode: window.google.maps.TravelMode.DRIVING }, (result, status) => {
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
        setOptimizedRoute({ stops: [] });
        setRouteSummary("Could not generate an optimized route.");
      }
      setIsOptimizing(false);
    });
  }, [workerLocation, currentBins, isLoaded]);

  // This useEffect fetches the initial data once. The polling is removed.
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/bins', { headers: { Authorization: `Bearer ${token}` } });
            const realBins = data.data.bins || [];
            const smartBins = realBins.filter(bin => bin.isSmartBin);
            setCurrentBins(smartBins);
        } catch (error) {
            console.error("Failed to fetch bin data.", error);
            toast.error("Could not load bin data.");
        } finally {
            setInitialLoading(false);
        }
    };
    
    fetchInitialData();
  }, []); // Empty array ensures this runs only once.

  // 3. NEW: This function triggers the animation and then the actual optimization.
  const handleStartOptimization = () => {
    setIsOptimizing(true); // This starts the CSS animation in the loader component.

    // Calculate a random animation duration between 5 and 8 seconds for a realistic feel.
    const animationDuration = Math.floor(Math.random() * 3000) + 5000;

    // After the animation is finished, hide the animation screen.
    setTimeout(() => {
      setShowOptimizationScreen(false);
    }, animationDuration);
  };
  
  // This useEffect triggers the REAL optimization only after the animation is hidden.
  useEffect(() => {
    if (!showOptimizationScreen && isLoaded && workerLocation && !initialLoading) {
      runRouteOptimization();
    }
  }, [showOptimizationScreen, isLoaded, workerLocation, initialLoading, runRouteOptimization]);
  
  const toggleStageForDeletion = (binIdToToggle) => {
    setBinsToDelete(prevStagedBins => {
      const isStaged = prevStagedBins.includes(binIdToToggle);
      if (isStaged) {
        return prevStagedBins.filter(id => id !== binIdToToggle);
      } else {
        return [...prevStagedBins, binIdToToggle];
      }
    });
  };
  
  const handleConfirmDeletion = () => {
    const remainingBins = currentBins.filter(bin => !binsToDelete.includes(bin._id));
    setBinsToDelete([]);
    setOptimizedRoute(null);
    setCurrentBins(remainingBins);
    toast.success(`${binsToDelete.length} bin(s) removed. Re-optimizing route...`);
  };

  const handleStartRoute = () => { if (optimizedRoute) { navigate('/worker/navigation', { state: { route: optimizedRoute.stops, workerLocation } }); } };
  
  // While waiting for initial data, Google Maps, or user location...
  if (!isLoaded || locationLoading || initialLoading) {
    return <Loader text="Preparing Route Planner..." />;
  }
  
  // 4. If we are in the pre-optimization phase, show the new animation component.
  if (showOptimizationScreen) {
    return (
      <RouteOptimizationLoader 
        onStart={handleStartOptimization} 
        isOptimizing={isOptimizing} 
      />
    );
  }

  // If the animation is done but we are still waiting for the route calculation...
  if (!optimizedRoute || isOptimizing) {
    return <Loader text="Finalizing Optimized Route..." />;
  }
  
  // The final view with the map and list.
  return (
    <div className="directions-page container fade-in">
      <header className="page-header"
              style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
        <h1>Today's Optimized Route</h1>
        {routeSummary && <p className="route-summary">{routeSummary}</p>}
      </header>

      {optimizedRoute.stops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p>{routeSummary || "No bins available for routing."}</p>
            <button onClick={runRouteOptimization} className="btn btn-primary" style={{marginTop: '1rem'}}><FaSync /> Try Again</button>
        </div>
      ) : (
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
                {binsToDelete.length > 0 && (<button onClick={handleConfirmDeletion} className="btn btn-danger regenerate-btn"><FaCheckCircle /> Confirm Deletions ({binsToDelete.length})</button>)}
                <button onClick={runRouteOptimization} className="btn btn-secondary regenerate-btn"><FaSync /> Regenerate</button>
                <button onClick={handleStartRoute} className="btn btn-primary start-route-btn"><FaRoute /> Start Route</button>
              </div>
            </div>
            <ul className="route-list">
              {optimizedRoute.stops.map((stop, index) => (
                <li key={stop.binId} className={`route-item ${binsToDelete.includes(stop._id) ? 'marked-for-deletion' : ''}`}>
                  <div className="route-number">{index + 1}</div>
                  <div className="route-details"><strong>Bin ID: {stop.binId}</strong><span>{stop.area}</span></div>
                  <span className={`route-status status-${stop.status.toLowerCase()}`}>{stop.status}</span>
                  <button onClick={() => toggleStageForDeletion(stop._id)} className="btn-delete-bin"><FaTrash /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directions;