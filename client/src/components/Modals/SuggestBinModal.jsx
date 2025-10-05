import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaMapSigns, FaInfoCircle, FaSync } from 'react-icons/fa';
import UniversalModal from './UniversalModal';

const SuggestBinModal = ({ isOpen, onClose, fullBinLocation }) => {
  const [nearbyBin, setNearbyBin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && fullBinLocation) {
      const fetchNearestBin = async () => {
        setLoading(true);
        try {
          // Call the new backend endpoint with the coordinates of the full bin
          const { data } = await axios.get(`/api/bins/nearest-empty`, {
            params: {
              lng: fullBinLocation.coordinates[0],
              lat: fullBinLocation.coordinates[1],
            }
          });
          if (data.success) {
            setNearbyBin(data.data);
          }
        } catch (error) {
          console.error("Failed to find nearby bin", error);
        } finally {
          setLoading(false);
        }
      };
      fetchNearestBin();
    }
  }, [isOpen, fullBinLocation]);

  const handleNavigate = () => {
    const { coordinates } = nearbyBin.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>Thank You For Your Report!</h2>
        <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
      </div>
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        {loading ? (
          <p><FaSync className="spinner" /> Finding a nearby empty bin...</p>
        ) : nearbyBin ? (
          <>
            <p style={{ fontSize: '1.1rem' }}>A collection has been scheduled. In the meantime, the nearest available bin is just a short walk away.</p>
            <p><strong>Bin ID: {nearbyBin.binId}</strong> in {nearbyBin.area}</p>
            <button className="btn btn-primary" onClick={handleNavigate} style={{ marginTop: '1rem' }}>
              <FaMapSigns /> Show Me the Way
            </button>
          </>
        ) : (
          <p><FaInfoCircle /> We couldn't find a nearby empty bin at the moment. Thank you for your help!</p>
        )}
      </div>
    </UniversalModal>
  );
};

export default SuggestBinModal;
