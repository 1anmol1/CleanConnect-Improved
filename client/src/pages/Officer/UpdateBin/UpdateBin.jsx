import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import { FaMapPin } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import '../../Shared/SharedForm.css'; // This should contain your base form styles
import './UpdateBin.css'; // This contains the new map-specific styles

// Helper object to define the center coordinates for supported cities
const cityCoordinates = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Kolhapur: { lat: 16.7048, lng: 74.2433 },
  // Add other cities from your seeder file as needed
};

const UpdateBin = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ binId: '', coordinates: '', area: '' });
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  // State to hold the locations of bins already in the system
  const [existingBins, setExistingBins] = useState([]);
  
  // State for the map's center and the position of the new draggable marker
  const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 }); // Default to Pune
  const [markerPosition, setMarkerPosition] = useState(mapCenter);

  // Hook to load the Google Maps JavaScript API script
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Effect to automatically center the map on the logged-in officer's city
  useEffect(() => {
    if (user?.city && cityCoordinates[user.city]) {
      const cityCenter = cityCoordinates[user.city];
      setMapCenter(cityCenter);
      setMarkerPosition(cityCenter); // Also place the new bin marker in the city center initially
    }
  }, [user?.city]);

  // Effect to fetch the list of areas for the dropdown menu
  useEffect(() => {
    const fetchAreas = async () => {
      if (user?.city) {
        setLoadingAreas(true);
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`/api/areas/${user.city}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAreas(data.data || []);
        } catch (error) {
          toast.error("Could not load areas for your city.");
        } finally {
            setLoadingAreas(false);
        }
      }
    };
    fetchAreas();
  }, [user?.city]);
  
  // Effect to fetch the locations of existing bins, but only when the map is opened
  useEffect(() => {
    const fetchExistingBins = async () => {
      if (isMapVisible && user?.city) {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get('/api/bins', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setExistingBins(data.data || []);
        } catch (error) {
          toast.error("Could not load existing bin locations.");
        }
      }
    };
    fetchExistingBins();
  }, [isMapVisible, user?.city]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This function is called when the user stops dragging the red marker on the map
  const handleMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    const newPosition = { lat: newLat, lng: newLng };
    setMarkerPosition(newPosition);
    // Update the form's coordinates input field in real-time with the new position
    setFormData(prev => ({ ...prev, coordinates: `${newLat.toFixed(6)}, ${newLng.toFixed(6)}` }));
  };

  // Handles the final submission of the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coordsArray = formData.coordinates.split(',').map(num => parseFloat(num.trim()));
      if (coordsArray.length !== 2 || isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
        toast.error("Invalid coordinates format. Please use 'Lat, Lng'.");
        return;
      }
      const payload = { 
          binId: formData.binId,
          area: formData.area,
          // GeoJSON format requires [Longitude, Latitude]
          coordinates: [coordsArray[1], coordsArray[0]] 
        };
      
      const token = localStorage.getItem('token');
      await axios.post('/api/bins', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New bin added to the network!');
      setFormData({ binId: '', coordinates: '', area: '' }); // Reset form
      setIsMapVisible(false); // Hide the map on success
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add bin.');
    }
  };

  if (loadError) return <div>Map cannot be loaded. Please check your API key.</div>;

  return (
    <div className="form-page-container container">
      <div className="form-card-container">
        <h2>Add New Smart Bin</h2>
        <p>Manage the smart bin network in {user?.city}.</p>
        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label htmlFor="binId">Bin ID</label>
            <input type="text" name="binId" value={formData.binId} onChange={handleChange} placeholder="e.g., PUNE-KTD-11" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="area">Area</label>
            <select name="area" value={formData.area} onChange={handleChange} required disabled={loadingAreas}>
              <option value="">{loadingAreas ? 'Loading areas...' : '-- Select an Area --'}</option>
              {areas.map(area => (
                <option key={area._id} value={area.name}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">GPS Coordinates (Lat, Lng)</label>
            <input type="text" name="coordinates" value={formData.coordinates} onChange={handleChange} placeholder="Pin on map or enter manually" required />
          </div>
          
          <button type="button" className="btn-toggle-map" onClick={() => setIsMapVisible(!isMapVisible)}>
            <FaMapPin /> {isMapVisible ? 'Hide Map' : 'Pin Location on Map'}
          </button>

          {isMapVisible && (
            <div className="map-container-wrapper">
              {!isLoaded ? (
                <Loader text="Loading Map..." />
              ) : (
                <GoogleMap
                  mapContainerClassName="add-bin-map-container"
                  center={mapCenter}
                  zoom={14}
                >
                  {/* 1. Render simple, grey markers for EXISTING bins for context */}
                  {existingBins.map(bin => (
                    <MarkerF
                      key={bin._id}
                      position={{ lat: bin.location.coordinates[1], lng: bin.location.coordinates[0] }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 5,
                        fillColor: '#808080', // Grey color
                        fillOpacity: 0.6,
                        strokeWeight: 0,
                      }}
                    />
                  ))}
                  
                  {/* 2. Render the one prominent, DRAGGABLE marker for the NEW bin */}
                  <MarkerF
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    zIndex={100} // Ensure it's on top of the grey markers
                  />
                </GoogleMap>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-submit">Add Bin to Network</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBin;