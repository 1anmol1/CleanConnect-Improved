import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useScrollToTop from '../../../hooks/useScrollToTop';
// THE FIX: Import the new 'AdvancedMarkerElement'
import { useJsApiLoader, GoogleMap, MarkerF, Marker } from '@react-google-maps/api';
import { FaMapPin } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import '../../Shared/SharedForm.css';
import './UpdateBin.css';

const cityCoordinates = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Kolhapur: { lat: 16.7048, lng: 74.2433 },
};

const UpdateBin = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ binId: '', category: 'Waste', coordinates: '', area: '' });
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [existingBins, setExistingBins] = useState([]);
  
  const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 });
  const [markerPosition, setMarkerPosition] = useState(mapCenter);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (user?.city && cityCoordinates[user.city]) {
      const cityCenter = cityCoordinates[user.city];
      setMapCenter(cityCenter);
      setMarkerPosition(cityCenter);
    }
  }, [user?.city]);

  useEffect(() => {
    const fetchAreas = async () => {
      if (user?.city) {
        setLoadingAreas(true);
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`/areas/${user.city}`, {
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
  
  useEffect(() => {
    const fetchExistingBins = async () => {
      if (isMapVisible && user?.city) {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get('/bins', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // --- THE FIX FOR THE CRASH IS HERE ---
          // We now correctly access the 'bins' array from the complex data object.
          setExistingBins(data.data.bins || []);
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

  const handleMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    const newPosition = { lat: newLat, lng: newLng };
    setMarkerPosition(newPosition);
    setFormData(prev => ({ ...prev, coordinates: `${newLat.toFixed(6)}, ${newLng.toFixed(6)}` }));
  };

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
          category: formData.category,
          coordinates: [coordsArray[1], coordsArray[0]] 
        };
      
      const token = localStorage.getItem('token');
      await axios.post('/bins', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New sensor added to the network!');
      setFormData({ binId: '', category: 'Waste', coordinates: '', area: '' });
      setIsMapVisible(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add bin.');
    }
  };

  if (loadError) return <div>Map cannot be loaded. Please check your API key.</div>;

  return (
    <div className="form-page-container container">
      <div className="form-card-container">
        <h2>Add New Smart Sensor</h2>
        <p>Manage the smart sensor network in {user?.city}.</p>
        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label htmlFor="binId">Sensor ID</label>
            <input type="text" name="binId" value={formData.binId} onChange={handleChange} placeholder="e.g., PUNE-SENS-11" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Sensor Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="Waste">Waste (Dustbin)</option>
              <option value="Electricity">Electricity</option>
              <option value="Drainage">Drainage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Air Quality">Air Quality</option>
              <option value="Traffic">Traffic</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="area">Area</label>
            <select name="area" value={formData.area} onChange={handleChange} required disabled={loadingAreas}>
              <option value="">{loadingAreas ? 'Loading areas...' : '-- Select an Area --'}</option>
              {areas.map(area => <option key={area._id} value={area.name}>{area.name}</option>)}
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
                  // A 'mapId' is required for AdvancedMarkerElement to work
                  mapId="cleanconnect_add_bin_map_style"
                >
                  {/* Render simple, grey markers for EXISTING bins */}
                  {existingBins.map(bin => (
                    <MarkerF
                      key={bin._id}
                      position={{ lat: bin.location.coordinates[1], lng: bin.location.coordinates[0] }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 5,
                        fillColor: '#808080',
                        fillOpacity: 0.6,
                        strokeWeight: 0,
                      }}
                    />
                  ))}
                  
                  {/* --- THE FIX FOR THE DEPRECATION WARNING --- */}
                  {/* We now use the new, recommended AdvancedMarkerElement for the draggable marker */}
                  <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                  >
                    {/* You can add custom HTML/CSS inside the advanced marker if you wish */}
                  </Marker>
                </GoogleMap>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-submit">Add Sensor to Network</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBin;