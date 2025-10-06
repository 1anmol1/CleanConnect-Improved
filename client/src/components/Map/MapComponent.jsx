import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, PolylineF } from '@react-google-maps/api';
import CustomInfoWindow from './CustomInfoWindow'; 
import { FaTrashAlt, FaTruck } from 'react-icons/fa';
import './MapComponent.css';

// --- Sub-Components for Different Marker Types ---

// 1. Dustbin Marker (No changes here)
const DustbinMarker = ({ marker, onMarkerClick }) => {
  let color = '#5cb85c';
  if (marker.fillLevel >= 90) color = '#d9534f';
  else if (marker.fillLevel >= 70) color = '#f0ad4e';

  const position = { lat: marker.location.coordinates[1], lng: marker.location.coordinates[0] };

  return (
    <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <div className="custom-marker-container" onClick={() => onMarkerClick(marker)}>
        <div className="marker-icon" style={{ backgroundColor: color }}><FaTrashAlt /></div>
        <div className="marker-label">{marker.binId}</div>
      </div>
    </OverlayView>
  );
};

// 2. Sanitation Vehicle Marker (No changes here)
const VehicleMarker = ({ vehicle }) => {
  if (!vehicle.liveLocation?.coordinates) return null;
  const position = {
    lat: vehicle.liveLocation.coordinates[1],
    lng: vehicle.liveLocation.coordinates[0],
  };

  return (
    <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <div className="vehicle-marker-container" title={`Worker: ${vehicle.name}`}>
        <div className="vehicle-icon"><FaTruck /></div>
      </div>
    </OverlayView>
  );
};

// --- THE FIX IS IN THIS COMPONENT ---
// 3. "You are here" User Marker (Upgraded)
// It now renders both a label (the dialogue box) and the pulsing dot.
const UserMarker = ({ position }) => {
  return (
    <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <div className="user-location-container">
        <div className="user-label">You are here</div>
        <div className="user-dot"></div>
      </div>
    </OverlayView>
  );
};


// --- The Main Map Component ---
const MapComponent = ({ center, markers = [], routeCoordinates = [], userLocation = null, vehicles = [] }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selectedMarker, setSelectedMarker] = useState(null);

  if (loadError) return <div className="map-error">Map cannot be loaded. Please check your API key.</div>;
  if (!isLoaded) return <div className="map-loading">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerClassName="map-container"
      center={center}
      zoom={14}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      {/* Render dustbin markers */}
      {markers.map((marker) => (
        <DustbinMarker key={marker._id} marker={marker} onMarkerClick={setSelectedMarker} />
      ))}

      {/* Render live sanitation vehicle markers */}
      {vehicles.map((vehicle) => (
        <VehicleMarker key={vehicle._id} vehicle={vehicle} />
      ))}

      {/* Render the "You are here" marker for the current user */}
      {userLocation && (
        <UserMarker position={userLocation} />
      )}
      
      {/* Render the smart info window when a dustbin is selected */}
      {selectedMarker && (
        <CustomInfoWindow 
          bin={selectedMarker} 
          onClose={() => setSelectedMarker(null)} 
        />
      )}
      
      {/* Render the worker's route polyline if provided */}
      {routeCoordinates.length > 0 && (
        <PolylineF path={routeCoordinates} options={{ strokeColor: '#007BFF', strokeOpacity: 0.8, strokeWeight: 5 }} />
      )}
    </GoogleMap>
  );
};

export default MapComponent;