import React, { useState, useEffect, useRef } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import { FaUsers, FaTools, FaMapMarkerAlt, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import MapComponent from '../../../components/Map/MapComponent';
import Loader from '../../../components/Loader/Loader';
import useWorkerLocation from '../../../hooks/useWorkerLocation.js';
import dashboardHeroImage from '/src/assets/citizendash.png';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { location: userLocation } = useWorkerLocation();
  const [loading, setLoading] = useState(true);
  
  const mapCenter = user?.city === 'Pune' 
    ? { lat: 18.5074, lng: 73.8041 }
    : { lat: 16.7033, lng: 74.4685 };

  const animationIntervalsRef = useRef([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchDataAndAnimate = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/bins', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedBins = data.data.bins || [];
        const initialVehicles = data.data.vehicles || [];

        const smartBins = fetchedBins.filter(bin => bin.isSmartBin);
        setBins(smartBins);
        setVehicles(initialVehicles);

        if (isLoaded && initialVehicles.length > 0) {
          animationIntervalsRef.current.forEach(clearInterval);
          animationIntervalsRef.current = [];
          
          const directionsService = new window.google.maps.DirectionsService();
          const vehiclesToAnimate = initialVehicles.slice(0, 2);
          
          vehiclesToAnimate.forEach((vehicle, index) => {
            const startPoint = { lat: 18.515 + (index * 0.01), lng: 73.79 - (index * 0.005) };
            const endPoint = { lat: 18.495 - (index * 0.01), lng: 73.82 + (index * 0.005) };

            directionsService.route(
              { origin: startPoint, destination: endPoint, travelMode: window.google.maps.TravelMode.DRIVING },
              (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  const routePath = result.routes[0].overview_path;
                  let step = 0;

                  const intervalId = setInterval(() => {
                    if (step >= routePath.length) step = 0;

                    const newPosition = { lat: routePath[step].lat(), lng: routePath[step].lng() };
                    
                    setVehicles(prev => prev.map(v => 
                      v._id === vehicle._id 
                        ? { ...v, liveLocation: { type: 'Point', coordinates: [newPosition.lng, newPosition.lat] } } 
                        : v
                    ));
                    step += 5;
                  }, 2000);
                  
                  animationIntervalsRef.current.push(intervalId);
                }
              }
            );
          });
        }

      } catch (error) {
        console.error("Failed to fetch live map data:", error);
        toast.error("Could not load live map data.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchDataAndAnimate();
    }
    
    return () => {
      animationIntervalsRef.current.forEach(clearInterval);
    };
  }, [isLoaded]);

  if (loading) {
    return <Loader text="Loading Live Operational Data..." />;
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
          <h3><FaMapMarkerAlt /> Live Operations Map</h3>
          <div className="officer-map-container">
            <MapComponent 
              center={mapCenter} 
              markers={bins}
              vehicles={vehicles}
              userLocation={userLocation}
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
          {/* ADD THIS NEW BUTTON/LINK */}
          <Link to="/officer/worker-progress" className="dashboard-card card">
            <FaChartLine className="card-icon" />
            <h3>Worker Progress</h3>
            <p>Track complaint resolution times and efficiency.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;