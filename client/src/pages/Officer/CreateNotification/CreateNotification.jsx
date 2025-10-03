import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import '../../Shared/SharedForm.css';
import './CreateNotification.css';

const CreateNotification = () => {
  const [formData, setFormData] = useState({ title: '', message: '', target: 'All', area: '' });
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();

  // Fetch the areas for the officer's city when the component loads
  useEffect(() => {
    const fetchAreas = async () => {
      if (user?.city && formData.target === 'Area') {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`/api/areas/${user.city}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAreas(data.data);
        } catch (error) {
          toast.error("Could not load areas for your city.");
        }
      }
    };

    fetchAreas();
  }, [user?.city, formData.target]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/notifications', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notification sent successfully!');
      setFormData({ title: '', message: '', target: 'All', area: '' }); // Reset form
    } catch (error) {
      toast.error('Failed to send notification.');
    }
  };

  return (
    <div className="form-page-container container">
      <div className="form-card-container">
        <h2>Send a New Notification</h2>
        <p>Broadcast messages to users in {user?.city}.</p>
        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Waste Collection Update" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="e.g., The waste collection vehicle will be delayed by 2 hours today in the Kothrud area due to unforeseen circumstances." required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="target">Send To</label>
            <select name="target" value={formData.target} onChange={handleChange} required>
              <option value="All">All Users (City-Wide Campaign)</option>
              <option value="Citizens">All Citizens in {user?.city}</option>
              <option value="Workers">All Workers in {user?.city}</option>
              <option value="Area">A Specific Area</option>
            </select>
          </div>
          {formData.target === 'Area' && (
            <div className="form-group">
              <label htmlFor="area">Select Area</label>
              <select name="area" value={formData.area} onChange={handleChange} required={formData.target === 'Area'}>
                <option value="">-- Select an Area --</option>
                {areas.map(areaName => <option key={areaName} value={areaName}>{areaName}</option>)}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-submit">Broadcast Notification</button>
        </form>
      </div>
    </div>
  );
};

export default CreateNotification;