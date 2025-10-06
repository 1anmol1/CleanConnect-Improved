import React, { useState, useEffect, useRef } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import { FaUsers, FaTools, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useJsApiLoader } from '@react-google-maps/api'; // For DirectionsService
import axios from 'axios';
import { toast } from 'react-toastify';
import MapComponent from '../../../components/Map/MapComponent';
import Loader from '../../../components/Loader/Loader';
import useWorkerLocation from '../../../hooks/useWorkerLocation.js'; // To get officer's location
import dashboardHeroImage from '/src/assets/citizendash.png';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [vehicles, setVehicles] = useState([]); // New state for live vehicles
  const { location: userLocation } = useWorkerLocation(); // Gets the officer's "You are here" location
  const [loading, setLoading] = useState(true);
  
  const mapCenter = user?.city === 'Pune' 
    ? { lat: 18.5074, lng: 73.8041 }
    : { lat: 16.7033, lng: 74.4685 };

  // This ref will store our animation intervals to manage them properly
  const animationIntervalsRef = useRef([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // This useEffect now fetches live data and starts the vehicle animation
  useEffect(() => {
    const fetchDataAndAnimate = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/bins', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // THE FIX: Correctly destructure the new response from the backend
        const fetchedBins = data.data.bins || [];
        const initialVehicles = data.data.vehicles || [];

        // Filter for only smart bins for the map display
        const smartBins = fetchedBins.filter(bin => bin.isSmartBin);
        setBins(smartBins);
        setVehicles(initialVehicles); // Set the initial positions of vehicles

        // --- DUMMY MOVING VEHICLE SIMULATION ---
        if (isLoaded && initialVehicles.length > 0) {
          // Clear any previous animations before starting new ones
          animationIntervalsRef.current.forEach(clearInterval);
          animationIntervalsRef.current = [];
          
          const directionsService = new window.google.maps.DirectionsService();
          // Animate the first two vehicles
          const vehiclesToAnimate = initialVehicles.slice(0, 2);
          
          vehiclesToAnimate.forEach((vehicle, index) => {
            // Define a unique dummy route for each vehicle
            const startPoint = { lat: 18.515 + (index * 0.01), lng: 73.79 - (index * 0.005) };
            const endPoint = { lat: 18.495 - (index * 0.01), lng: 73.82 + (index * 0.005) };

            directionsService.route(
              { origin: startPoint, destination: endPoint, travelMode: window.google.maps.TravelMode.DRIVING },
              (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  const routePath = result.routes[0].overview_path;
                  let step = 0;

                  const intervalId = setInterval(() => {
                    if (step >= routePath.length) step = 0; // Loop the animation

                    const newPosition = { lat: routePath[step].lat(), lng: routePath[step].lng() };
                    
                    setVehicles(prev => prev.map(v => 
                      v._id === vehicle._id 
                        ? { ...v, liveLocation: { type: 'Point', coordinates: [newPosition.lng, newPosition.lat] } } 
                        : v
                    ));
                    step += 5; // Adjust step for animation speed
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
    
    // Crucial cleanup function: stops all animations when the page is left
    return () => {
      animationIntervalsRef.current.forEach(clearInterval);
    };
  }, [isLoaded]); // This effect runs once the Google Maps script is loaded.

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
              markers={bins}         // Pass the list of smart bins
              vehicles={vehicles}      // Pass the list of live vehicles
              userLocation={userLocation} // Pass the officer's "You are here" location
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