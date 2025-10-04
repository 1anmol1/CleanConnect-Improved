import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { FaListOl, FaRoute, FaSync, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import MapComponent from '../../../components/Map/MapComponent.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import useWorkerLocation from '../../../hooks/useWorkerLocation.js';
import './Directions.css';

// This is our fallback data.
const mockBinsData = [
    { _id: "60d5f1c7b54764421b7156e2", binId: "KTD-007", area: "Kothrud", location: { coordinates: [73.7889, 18.5145] }, fillLevel: 60, status: "Empty" },
    { _id: "60d5f1c7b54764421b7156dc", binId: "PUNE-KTD-01", area: "Kothrud", location: { coordinates: [73.8041, 18.5074] }, fillLevel: 95, status: "Full" },
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
  const [currentBins, setCurrentBins] = useState([]); 
  const [binsToDelete, setBinsToDelete] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });
  
  // This useEffect handles fetching and merging live data with mock data.
  useEffect(() => {
    const fetchAndMergeBins = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/bins', { headers: { Authorization: `Bearer ${token}` } });
            const realBins = data.data || [];
            const realBinsMap = new Map(realBins.map(bin => [bin.binId, bin]));
            const mergedBins = mockBinsData.map(mockBin => {
                const realBinData = realBinsMap.get(mockBin.binId);
                return realBinData ? { ...mockBin, fillLevel: realBinData.fillLevel, status: realBinData.status } : mockBin;
            });
            setCurrentBins(mergedBins);
        } catch (error) {
            console.error("Failed to fetch live bin data, using fallback mock data.", error);
            setCurrentBins(mockBinsData);
        } finally {
            setInitialLoading(false);
        }
    };
    
    fetchAndMergeBins();
    const intervalId = setInterval(fetchAndMergeBins, 15000);
    return () => clearInterval(intervalId);
  }, []);

  // This useEffect handles running the optimization.
  useEffect(() => {
    if (isLoaded && workerLocation && !initialLoading) {
      runRouteOptimization();
    }
  }, [isLoaded, workerLocation, currentBins, initialLoading]);

  // All handler functions remain the same.
  const toggleStageForDeletion = (binId) => { setBinsToDelete(prev => prev.includes(binId) ? prev.filter(id => id !== binId) : [...prev, binId]); };
  
  const handleConfirmDeletion = () => {
    const remainingBins = currentBins.filter(bin => !binsToDelete.includes(bin._id));
    setBinsToDelete([]);
    setOptimizedRoute(null); // Clear the old route
    setCurrentBins(remainingBins); // This state change triggers the useEffect to re-optimize
    toast.success(`${binsToDelete.length} bin(s) removed. Re-optimizing route...`);
  };

  const runRouteOptimization = () => {
    if (!workerLocation) return;
    if (currentBins.length < 2) {
      setOptimizedRoute({ stops: [] }); // Set an empty route, not null
      setRouteSummary(`Not enough bins to generate a route.`);
      return;
    }
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
        // THE FIX: If the API fails, set an empty but valid route object to prevent a crash.
        setOptimizedRoute({ stops: [] });
        setRouteSummary("Could not generate an optimized route.");
      }
      setIsOptimizing(false);
    });
  };

  const handleStartRoute = () => { if (optimizedRoute) { navigate('/worker/navigation', { state: { route: optimizedRoute.stops, workerLocation } }); } };

  // This is the initial loading state for the entire page.
  if (!isLoaded || locationLoading || initialLoading) {
    return <Loader text="Generating your optimized route for today..." />;
  }

  // After initial loading, we always render the main component structure.
  // We use conditional rendering *inside* the component to handle the "no route" case.
  return (
    <div className="directions-page container fade-in">
      <header className="page-header">
        <h1>Today's Optimized Route</h1>
        {/* Only show the summary if a route was successfully generated */}
        {routeSummary && <p className="route-summary">{routeSummary}</p>}
      </header>

      {/* THE FIX: Check if optimizedRoute and its 'stops' array exist before trying to render them. */}
      {!optimizedRoute || isOptimizing ? (
        <Loader text="Optimizing route..." />
      ) : optimizedRoute.stops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p>{routeSummary || "No bins available for routing."}</p>
            <button onClick={runRouteOptimization} className="btn btn-primary" style={{marginTop: '1rem'}}>
                <FaSync /> Try Again
            </button>
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
                <li key={stop.binId} className={`route-item ${binsToDelete.includes(stop._id) ? 'marked-for-deletion' : ''}`}>
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
      )}
    </div>
  );
};

export default Directions;