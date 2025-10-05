import React, { useState } from 'react';
// THE FIX: Import 'MarkerF' instead of 'AdvancedMarkerElement'
import { GoogleMap, useJsApiLoader, OverlayView, PolylineF, MarkerF } from '@react-google-maps/api';
import CustomInfoWindow from './CustomInfoWindow'; 
import { FaTrashAlt } from 'react-icons/fa';
import './MapComponent.css';

// Custom Marker for Dustbins (This uses OverlayView and is already perfect)
const CustomMarker = ({ marker, onMarkerClick }) => {
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

const MapComponent = ({ center, markers, routeCoordinates = [], zoom = 14, workerLocation = null }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selectedMarker, setSelectedMarker] = useState(null);

  if (loadError) return <div className="map-error">Map cannot be loaded.</div>;
  if (!isLoaded) return <div className="map-loading">Loading Map...</div>;

  // This is the icon for the worker's location dot
  const workerIcon = {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: 'white',
  };

  return (
    <GoogleMap
      mapContainerClassName="map-container"
      center={center}
      zoom={zoom}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      // The 'mapId' is not needed for MarkerF, so it's removed to prevent other errors.
    >
      {/* Render dustbin markers using our custom overlay */}
      {markers.map((marker) => (
        <CustomMarker key={marker.binId} marker={marker} onMarkerClick={setSelectedMarker} />
      ))}

      {/* THE FIX: Use the stable <MarkerF> component for the worker's location dot */}
      {workerLocation && (
        <MarkerF position={workerLocation} icon={workerIcon} zIndex={100} />
      )}
      
      {/* The CustomInfoWindow now receives the full marker object */}
      {selectedMarker && (
        <CustomInfoWindow 
          bin={selectedMarker} 
          onClose={() => setSelectedMarker(null)} 
        />
      )}
      
      {/* Polyline for the route */}
      {routeCoordinates.length > 0 && (
        <PolylineF path={routeCoordinates} options={{ strokeColor: '#007BFF', strokeOpacity: 0.8, strokeWeight: 5 }} />
      )}
    </GoogleMap>
  );
};

export default MapComponent;