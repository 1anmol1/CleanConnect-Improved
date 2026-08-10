import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InfoWindowF } from '@react-google-maps/api';
import { FaInfoCircle, FaSync, FaMapMarkerAlt } from 'react-icons/fa';
import './CustomInfoWindow.css'; // The stylesheet for this component

// This is a small, specialized component to render a single child bin in the format you requested.
const ChildBinItem = ({ bin }) => (
  <p className="child-bin-line">
    {bin.binId} status: {bin.manualFillLevel}
  </p>
);

const CustomInfoWindow = ({ item, onClose }) => {
  const [childBins, setChildBins] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // This effect runs whenever a new bin marker is clicked.
  useEffect(() => {
    const fetchChildBins = async () => {
      // We only fetch children if the selected bin is a smart bin.
      if (item && item.isSmartBin) {
        setLoadingChildren(true);
        try {
          const token = localStorage.getItem('token');
          // Make an API call to the backend to get the children for this parent bin.
          const { data } = await axios.get(`/bins/${item._id}/children`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setChildBins(data.data || []);
        } catch (error) {
          console.error("Failed to fetch child bins", error);
          setChildBins([]); // Reset to empty on error
        } finally {
          setLoadingChildren(false);
        }
      } else {
        // If the clicked item is not a smart bin, there are no children to show.
        setChildBins([]);
      }
    };

    fetchChildBins();
  }, [item]); // This dependency ensures the effect re-runs when you click a different item.

  // Don't render anything if no item is selected.
  if (!item) return null;

  const isComplaint = !!item.issueType;
  
  // Determine position based on item type
  let position;
  if (isComplaint) {
      position = { lat: item.location.lat, lng: item.location.lng };
  } else if (item.location && item.location.coordinates) {
      position = { lat: item.location.coordinates[1], lng: item.location.coordinates[0] };
  } else {
      return null;
  }

  return (
    <InfoWindowF
      position={position}
      onCloseClick={onClose}
    >
      <div className="custom-infowindow">
        {isComplaint ? (
            <div className="main-bin-info">
              <h3>{item.issueType}</h3>
              <p>Status: {item.status}</p>
              <p>Priority: {item.priority}</p>
              {item.description && <p style={{fontStyle: 'italic', fontSize: '0.9em'}}>{item.description}</p>}
            </div>
        ) : (
            <div className="main-bin-info">
              <h3>{item.binId}</h3>
              <p>Status: {item.status} ({item.fillLevel}%)</p>
            </div>
        )}
        
        {/* This section is only displayed for smart bins */}
        {!isComplaint && item.isSmartBin && (
          <div className="child-bins-section">
            {loadingChildren ? (
              <div className="loading-children"><FaSync className="spinner" /> Loading nearby bins...</div>
            ) : childBins.length > 0 ? (
              <div className="child-bins-list">
                {/* Map over the fetched child bins and render each one */}
                {childBins.map(child => <ChildBinItem key={child._id} bin={child} />)}
              </div>
            ) : (
              <p className="no-children-text"><FaInfoCircle /> No associated bins found.</p>
            )}
          </div>
        )}
      </div>
    </InfoWindowF>
  );
};

export default CustomInfoWindow;

