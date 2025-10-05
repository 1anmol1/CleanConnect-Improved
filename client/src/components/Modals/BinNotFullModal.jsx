import React from 'react';
import { FaTimes, FaBuilding, FaMapSigns } from 'react-icons/fa';
import UniversalModal from './UniversalModal';

const BinNotFullModal = ({ isOpen, onClose }) => {
  // Hardcoded address for the Pune Municipal Corporation main office
  const officeLocation = 'Pune Municipal Corporation, Shivajinagar, Pune, Maharashtra';
  
  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(officeLocation)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>Bin Not Detected as Full</h2>
        <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
      </div>
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem' }}>Thank you for your vigilance! Our sensors indicate this bin is not yet full.</p>
        <p>If you believe this is an error or see waste spilled nearby, we encourage you to report it directly so we can investigate.</p>
        <button className="btn btn-primary" onClick={handleNavigate} style={{ marginTop: '1rem' }}>
          <FaMapSigns /> Navigate to Municipal Office
        </button>
      </div>
    </UniversalModal>
  );
};

export default BinNotFullModal;