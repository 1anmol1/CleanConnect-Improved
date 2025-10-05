import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InfoWindowF } from '@react-google-maps/api';
import { FaTrashAlt, FaInfoCircle, FaSync, FaMapMarkerAlt } from 'react-icons/fa';
import './CustomInfoWindow.css'; // We'll create this CSS file next

// Helper component for displaying a single child bin
const ChildBinItem = ({ bin }) => (
  <div className="child-bin-item">
    <FaTrashAlt className={`child-bin-icon status-${bin.manualStatus?.toLowerCase().replace('-', '')}`} />
    <div className="child-bin-details">
      <strong>{bin.binId}</strong>
      <span>Status: {bin.manualStatus}</span>
      <small>Updated: {new Date(bin.lastManualUpdate || bin.createdAt).toLocaleDateString()}</small>
    </div>
    {/* In a real app, an "Update Status" button would go here for authorized users */}
  </div>
);

const CustomInfoWindow = ({ bin, onClose }) => {
  const [childBins, setChildBins] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // This effect runs when a smart bin is selected
  useEffect(() => {
    const fetchChildBins = async () => {
      if (bin && bin.isSmartBin) {
        setLoadingChildren(true);
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`/api/bins/${bin._id}/children`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setChildBins(data.data || []);
        } catch (error) {
          console.error("Failed to fetch child bins", error);
        } finally {
          setLoadingChildren(false);
        }
      }
    };

    fetchChildBins();
  }, [bin]); // Re-fetches when a different bin is selected

  if (!bin) return null;

  return (
    <InfoWindowF
      position={{ lat: bin.location.coordinates[1], lng: bin.location.coordinates[0] }}
      onCloseClick={onClose}
    >
      <div className="custom-infowindow">
        <div className="main-bin-info">
          <h3>{bin.binId}</h3>
          <p><strong>Status:</strong> {bin.status} ({bin.fillLevel}%)</p>
          <p><strong>Area:</strong> {bin.area}</p>
        </div>
        
        {/* Conditionally render the child bin section */}
        {bin.isSmartBin && (
          <div className="child-bins-section">
            <h4><FaMapMarkerAlt /> Nearby Manual Bins</h4>
            {loadingChildren ? (
              <div className="loading-children"><FaSync className="spinner" /> Loading...</div>
            ) : childBins.length > 0 ? (
              <div className="child-bins-list">
                {childBins.map(child => <ChildBinItem key={child._id} bin={child} />)}
              </div>
            ) : (
              <p className="no-children-text"><FaInfoCircle /> No associated manual bins found.</p>
            )}
          </div>
        )}
      </div>
    </InfoWindowF>
  );
};

export default CustomInfoWindow;
