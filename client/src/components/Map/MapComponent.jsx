import React, { useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
  InfoWindowF,
  PolylineF,
  MarkerF // 1. We will use MarkerF, which is stable and supported.
} from '@react-google-maps/api';
import { FaTrashAlt } from 'react-icons/fa';
import './MapComponent.css';

// Custom Marker for Dustbins (This part remains the same)
const CustomMarker = ({ marker, onMarkerClick }) => {
  let color = '#5cb85c';
  if (marker.fillLevel >= 90) color = '#d9534f';
  else if (marker.fillLevel >= 70) color = '#f0ad4e';

  const position = {
    lat: marker.location.coordinates[1],
    lng: marker.location.coordinates[0],
  };

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

  // 2. THE FIX: We bring back the 'workerIcon' object to style the MarkerF component.
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
      // 3. The 'mapId' is not needed for MarkerF, so it can be removed.
    >
      {/* Dustbin markers (no change here) */}
      {markers.map((marker) => (
        <CustomMarker key={marker.binId} marker={marker} onMarkerClick={setSelectedMarker} />
      ))}

      {/* 4. THE FIX: We use the stable <MarkerF> component for the worker's location. */}
      {workerLocation && (
        <MarkerF 
          position={workerLocation} 
          icon={workerIcon} 
          zIndex={100} // Ensure it's on top
        />
      )}

      {/* InfoWindow (no change here) */}
      {selectedMarker && (
        <InfoWindowF
          position={{ lat: selectedMarker.location.coordinates[1], lng: selectedMarker.location.coordinates[0] }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div>
            <h4>Bin ID: {selectedMarker.binId}</h4>
            <p><strong>Status:</strong> {selectedMarker.status} ({selectedMarker.fillLevel}%)</p>
          </div>
        </InfoWindowF>
      )}
      
      {/* Polyline (no change here) */}
      {routeCoordinates.length > 0 && (
        <PolylineF path={routeCoordinates} options={{ strokeColor: '#007BFF', strokeOpacity: 0.8, strokeWeight: 5 }} />
      )}
    </GoogleMap>
  );
};

export default MapComponent;