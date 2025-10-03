import React from 'react';
import { FaTimes } from 'react-icons/fa';
import UniversalModal from './UniversalModal'; // Using the universal modal
import './ViewFeedbackModal.css';

const ViewFeedbackModal = ({ isOpen, onClose, feedbacks = [] }) => {
  if (!isOpen) return null;

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="view-feedback-modal-content">
        <div className="modal-header">
          <h2>Citizen Feedback Log</h2>
          <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
        </div>
        <div className="feedback-log-container">
          {feedbacks.length > 0 ? (
            feedbacks.map((fb, index) => (
              <div key={index} className="feedback-log-item">
                <p>"{fb.comment || 'No comment provided.'}"</p>
                <small>Submitted on {new Date(fb.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p>No comments have been submitted yet.</p>
          )}
        </div>
      </div>
    </UniversalModal>
  );
};

export default ViewFeedbackModal;
