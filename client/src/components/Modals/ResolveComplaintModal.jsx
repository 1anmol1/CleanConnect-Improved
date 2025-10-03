import React, { useState, useEffect } from 'react';
import { FaTimes, FaCamera } from 'react-icons/fa';
import UniversalModal from './UniversalModal'; // Using the universal modal
import './ResolveComplaintModal.css';

const ResolveComplaintModal = ({ isOpen, onClose, onSubmit, task }) => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  // Reset state when modal opens for a new task
  useEffect(() => {
    if (isOpen) {
      setPhoto(null);
      setPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photo) {
      alert('Please upload a photo as proof of resolution.');
      return;
    }
    onSubmit(task._id, photo);
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="resolve-complaint-modal-content">
        <div className="modal-header">
          <h2>Resolve Task</h2>
          <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
        </div>
        <div className="modal-body">
          <p className="task-info-modal"><strong>Issue:</strong> {task.issueType} - {task.description}</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resolutionPhoto">Upload Proof of Resolution</label>
              <input type="file" id="resolutionPhoto" onChange={handleFileChange} accept="image/*" required />
            </div>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Resolution preview" />
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-submit">
              <FaCamera /> Submit Resolution
            </button>
          </form>
        </div>
      </div>
    </UniversalModal>
  );
};

export default ResolveComplaintModal;
