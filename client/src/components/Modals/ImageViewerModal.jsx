import React from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import UniversalModal from './UniversalModal'; // We reuse the universal modal for consistency
import { getImageUrl } from '../../../utils/getImageUrl';
import './ImageViewerModal.css';

const ImageViewerModal = ({ isOpen, onClose, complaint, onReject }) => {
  // If the modal isn't open or there's no complaint data, render nothing.
  if (!isOpen || !complaint) {
    return null;
  }

  // A handler for the reject button click
  const handleRejectClick = () => {
    // This will call the function passed down from ComplaintManagement.jsx
    onReject(complaint._id);
    onClose(); // Close the modal after action
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="image-viewer-modal-content">
        <div className="modal-header">
          <h2>Complaint Proof: {complaint.binId || 'N/A'}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p><strong>Issue Type:</strong> {complaint.issueType}</p>
          
          <div className="image-container">
            {complaint.imageUrl ? (
              <img src={getImageUrl(complaint.imageUrl)} alt="Complaint Proof" />
            ) : (
              <p className="no-image-text">No proof image was provided for this complaint.</p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          {/* This is the new Reject button for the officer */}
          <button className="btn btn-danger" onClick={handleRejectClick}>
            <FaTrash /> Reject Complaint (Invalid Image)
          </button>
        </div>
      </div>
    </UniversalModal>
  );
};

export default ImageViewerModal;
