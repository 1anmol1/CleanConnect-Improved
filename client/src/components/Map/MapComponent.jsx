import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, PolylineF } from '@react-google-maps/api';
import CustomInfoWindow from './CustomInfoWindow'; 
import { FaTrashAlt, FaTruck, FaExclamationTriangle, FaRoad, FaLightbulb, FaTint, FaTree, FaTrash, FaBiohazard } from 'react-icons/fa';
import './MapComponent.css';

// --- Sub-Components for Different Marker Types ---

// 1. Dustbin Marker
const DustbinMarker = React.memo(({ marker, onMarkerClick }) => {
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
});

// 2. Sanitation Vehicle Marker
const VehicleMarker = React.memo(({ vehicle }) => {
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
});

// 3. "You are here" User Marker
const UserMarker = React.memo(({ position }) => {
  return (
    <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <div className="user-location-container">
        <div className="user-label">You are here</div>
        <div className="user-dot"></div>
      </div>
    </OverlayView>
  );
});

// 4. Issue Marker (For reported complaints)
const IssueMarker = React.memo(({ issue, onMarkerClick }) => {
  let color = '#d9534f'; // Red for high/emergency
  if (issue.priority === 'Medium') color = '#f0ad4e'; // Orange
  if (issue.priority === 'Low') color = '#5bc0de'; // Blue

  let position = null;
  if (issue.location && issue.location.lat && issue.location.lng) {
    position = { lat: issue.location.lat, lng: issue.location.lng };
  } else if (issue.city) {
    return null;
  }
  if (!position) return null;

  let IconComponent = FaExclamationTriangle;
  if (issue.issueType === 'Overflowing Bin') IconComponent = FaTrash;
  else if (issue.issueType === 'Damaged Bin') IconComponent = FaTrashAlt;
  else if (issue.issueType === 'Waste Spilled Nearby') IconComponent = FaBiohazard;
  else if (issue.issueType === 'Pothole') IconComponent = FaRoad;
  else if (issue.issueType === 'Streetlight Issue') IconComponent = FaLightbulb;
  else if (issue.issueType === 'Water Leakage') IconComponent = FaTint;
  else if (issue.issueType === 'Fallen Tree') IconComponent = FaTree;

  return (
    <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <div className="custom-marker-container" onClick={() => onMarkerClick(issue)}>
        <div className="marker-icon" style={{ backgroundColor: color }}><IconComponent /></div>
        <div className="marker-label">{issue.issueType || 'Issue'}</div>
      </div>
    </OverlayView>
  );
});

// --- The Main Map Component ---
const MapComponent = ({ center, markers = [], complaints = [], routeCoordinates = [], userLocation = null, vehicles = [] }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selectedMarker, setSelectedMarker] = useState(null);

  if (loadError) return (
    <div className="card map-error" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff3f3' }}>
        <FaExclamationTriangle style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '10px' }} />
        <h3>Map Could Not Be Loaded</h3>
        <p>Google Maps API Error (ApiProjectMapError). Please check if your API Key is valid and unrestricted.</p>
    </div>
  );
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

      {/* Render Issue (Complaint) markers */}
      {complaints.map((issue) => (
        <IssueMarker key={issue._id} issue={issue} onMarkerClick={setSelectedMarker} />
      ))}

      {/* Render the "You are here" marker for the current user */}
      {userLocation && (
        <UserMarker position={userLocation} />
      )}
      
      {/* Render the smart info window when a marker is selected */}
      {selectedMarker && (
        <CustomInfoWindow 
          item={selectedMarker} 
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