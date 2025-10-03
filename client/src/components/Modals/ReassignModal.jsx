import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import UniversalModal from './UniversalModal';
import './ReassignModal.css';

const ReassignModal = ({ isOpen, onClose, workers = [], onSubmit }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      // Using a simple alert for now, you can replace with a more robust notification
      alert('Please select a worker.');
      return;
    }
    onSubmit(selectedWorkerId);
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="reassign-modal-content">
        <div className="modal-header">
          <h2>Re-assign Task</h2>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="worker-select">Select a new worker for this task</label>
              <select
                id="worker-select"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                required
              >
                <option value="">-- Choose a Worker --</option>
                {workers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.area})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Re-assign</button>
          </form>
        </div>
      </div>
    </UniversalModal>
  );
};

export default ReassignModal;
