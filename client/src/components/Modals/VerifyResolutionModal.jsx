import React from 'react';
import { FaTimes, FaCheck, FaUndo, FaImage } from 'react-icons/fa';
import UniversalModal from './UniversalModal';
import './VerifyResolutionModal.css';

const VerifyResolutionModal = ({ isOpen, onClose, onVerify, task }) => {
  if (!task) return null;

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="verify-resolution-modal">
        <div className="modal-header">
          <h2>Verify Resolution</h2>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p><strong>Issue:</strong> {task.issueType}</p>
          <p><strong>Description:</strong> {task.description}</p>
          
          {task.resolutionImageUrl ? (
            <div className="image-preview">
              <h3>Resolution Proof</h3>
              <img src={`http://localhost:5000${task.resolutionImageUrl}`} alt="Resolution Proof" />
              <a href={`http://localhost:5000${task.resolutionImageUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-info btn-block view-proof-btn">
                <FaImage /> View Full Proof
              </a>
            </div>
          ) : <p>No proof image was uploaded by the worker.</p>}
          
          <div className="verification-actions">
            <button className="btn btn-primary" onClick={() => onVerify(task._id, 'Approved')}>
              <FaCheck /> Approve Resolution
            </button>
            <button className="btn btn-danger" onClick={() => onVerify(task._id, 'Rejected')}>
              <FaUndo /> Reject & Re-assign
            </button>
          </div>
        </div>
      </div>
    </UniversalModal>
  );
};

export default VerifyResolutionModal;
