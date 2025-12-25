import React, { useState, useEffect, useRef } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useJsApiLoader } from '@react-google-maps/api'; // Needed for DirectionsService
import { FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import MapComponent from '../../../components/Map/MapComponent.jsx';
import useWorkerLocation from '../../../hooks/useWorkerLocation.js'; // Re-used to get citizen's location
import dashboardHeroImage from '/src/assets/citizendash.png';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [vehicles, setVehicles] = useState([]); // New state for vehicles
  const { location: userLocation } = useWorkerLocation(); // Gets the user's "You are here" location
  const [loading, setLoading] = useState(true);
  
  const mapCenter = user?.city === 'Pune' 
    ? { lat: 18.5074, lng: 73.8041 } 
    : { lat: 16.7033, lng: 74.4685 };

  // This ref will store our animation intervals to manage them properly
  const animationIntervalsRef = useRef([]);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    // This function runs once to fetch data and start the animations
    const fetchDataAndAnimate = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/bins', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // THE FIX: Correctly destructure the response from the backend
        const fetchedBins = data.data.bins || [];
        const initialVehicles = data.data.vehicles || [];

        const smartBins = fetchedBins.filter(bin => bin.isSmartBin);
        setBins(smartBins);
        setVehicles(initialVehicles); // Set the initial positions

        // --- DUMMY MOVING VEHICLE SIMULATION ---
        if (isLoaded && initialVehicles.length > 0) {
          const directionsService = new window.google.maps.DirectionsService();
          
          // Animate the first two vehicles from your seeder data
          const vehiclesToAnimate = initialVehicles.slice(0, 2);
          
          vehiclesToAnimate.forEach((vehicle, index) => {
            // Define a unique dummy route for each vehicle
            const startPoint = { lat: 18.515 + (index * 0.01), lng: 73.79 - (index * 0.005) };
            const endPoint = { lat: 18.495 - (index * 0.01), lng: 73.82 + (index * 0.005) };

            directionsService.route(
              {
                origin: startPoint,
                destination: endPoint,
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  const routePath = result.routes[0].overview_path;
                  let step = 0;

                  // Start an interval to animate this specific vehicle
                  const intervalId = setInterval(() => {
                    if (step >= routePath.length) step = 0; // Loop the animation

                    const newPosition = { lat: routePath[step].lat(), lng: routePath[step].lng() };
                    
                    // Update the state for this one vehicle
                    setVehicles(prevVehicles => 
                      prevVehicles.map(v => 
                        v._id === vehicle._id 
                          ? { ...v, liveLocation: { type: 'Point', coordinates: [newPosition.lng, newPosition.lat] } } 
                          : v
                      )
                    );
                    step += 5; // Increase step for faster, smoother animation
                  }, 2000); // Update position every 2 seconds
                  
                  // Store the interval ID so we can clear it later
                  animationIntervalsRef.current.push(intervalId);
                }
              }
            );
          });
        }

      } catch (error) {
        console.error("Failed to fetch live map data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) { // Only run this logic after the Google Maps script has loaded
        fetchDataAndAnimate();
    }

    // Crucial cleanup function: stops all animations when you navigate away
    return () => {
      animationIntervalsRef.current.forEach(clearInterval);
    };
  }, [isLoaded]); // Run only when 'isLoaded' changes

  if (loading) return <Loader text="Loading Live Map Data..." />;

  return (
    <div className="citizen-dashboard container fade-in">
      <header className="page-header"
              style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
        <h1>Welcome, {user?.name}!</h1>
        <p>Here's a live overview of smart bins and vehicles in your area.</p>
      </header>
      <div className="dashboard-content card">
        <h3><FaMapMarkerAlt /> Live City Map</h3>
        <div className="map-wrapper" style={{ height: '500px', width: '100%' }}>
          <MapComponent
            center={mapCenter}
            markers={bins}
            vehicles={vehicles} // Pass the live vehicle data
            userLocation={userLocation} // Pass the "You are here" location
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