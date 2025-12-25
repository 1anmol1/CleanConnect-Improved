import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth.js';
import UniversalModal from './UniversalModal';
import './AddWorkerModal.css';

const AddWorkerModal = ({ isOpen, onClose, onAddWorker }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    workerId: '',
    area: ''
  });
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAreas = async () => {
      if (isOpen && user?.city) {
        try {
          const token = localStorage.getItem('token');
          // Assuming the API returns an array of area objects: [{ name: 'Area1' }, { name: 'Area2' }]
          const { data } = await axios.get(`/areas/${user.city}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAreas(data.data || []);
        } catch (error) {
          console.error("Failed to fetch areas for modal", error);
        }
      }
    };
    fetchAreas();
  }, [isOpen, user?.city]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddWorker(formData);
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="add-worker-modal-content">
        <div className="modal-header">
          <h2>Add New Worker</h2>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="styled-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Suresh Jadhav"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Worker Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., suresh@cleanconnect.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="workerId">Worker ID</label>
              <input
                id="workerId"
                type="text"
                name="workerId"
                value={formData.workerId}
                onChange={handleChange}
                placeholder="e.g., WKR-PUNE-03"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="area">Assigned Area</label>
              <select
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
              >
                <option value="">-- Select an Area --</option>
                {areas.map(area => (
                  <option key={area.name} value={area.name}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-submit">
              Add Worker
            </button>
          </form>
        </div>
      </div>
    </UniversalModal>
  );
};

export default AddWorkerModal;
