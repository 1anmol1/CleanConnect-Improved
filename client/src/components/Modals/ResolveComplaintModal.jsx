import React, { useState, useRef, useEffect } from 'react';
import UniversalModal from './UniversalModal';
import { toast } from 'react-toastify';
import { FaImage, FaCamera, FaCheckCircle } from 'react-icons/fa';
import './ResolveComplaintModal.css';

const ResolveComplaintModal = ({ isOpen, onClose, onResolve, task }) => {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null); // For showing the selected image
  const [loading, setLoading] = useState(false);
  
  // Refs for the hidden file inputs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Reset state when the modal is closed or the task changes
  useEffect(() => {
    if (!isOpen) {
      setPhoto(null);
      setPhotoPreview(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      toast.error("A proof-of-resolution photo is required.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('resolutionPhoto', photo);
    
    // The onResolve function is passed from the parent component (Resolutions.jsx)
    // We await it to handle the API call logic there.
    await onResolve(task._id, formData);
    setLoading(false);
  };

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Resolve Task: ${task?.issueType}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <p>Please upload or take a photo to prove that the issue has been resolved.</p>
        </div>

        {/* --- NEW FILE INPUT SECTION --- */}
        <div className="form-group">
          <label>Attach Proof of Resolution</label>
          <div className="file-input-buttons">
            <button type="button" className="btn-file-input" onClick={() => fileInputRef.current.click()}>
              <FaImage /> Choose from Library
            </button>
            <button type="button" className="btn-file-input" onClick={() => cameraInputRef.current.click()}>
              <FaCamera /> Take a Photo
            </button>
          </div>
          {/* Hidden inputs to trigger file selection */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" style={{ display: 'none' }} />
          
          {photoPreview && (
            <div className="image-preview-container">
              <img src={photoPreview} alt="Resolution preview" className="image-preview" />
            </div>
          )}
        </div>
        {/* --- END OF NEW SECTION --- */}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-success" disabled={!photo || loading}>
            {loading ? 'Submitting...' : <><FaCheckCircle /> Mark as Resolved</>}
          </button>
        </div>
      </form>
    </UniversalModal>
  );
};

export default ResolveComplaintModal;