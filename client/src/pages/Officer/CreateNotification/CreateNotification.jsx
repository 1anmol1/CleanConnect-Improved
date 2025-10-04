import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import { FaBullhorn } from 'react-icons/fa';
import '../../Shared/SharedForm.css';
import './CreateNotification.css';

const CreateNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'All', // The user-friendly option from the dropdown
    area: ''
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetches areas for the officer's city when the "Area" target is selected
  useEffect(() => {
    const fetchAreas = async () => {
      if (user?.city && (formData.target === 'AreaCitizens' || formData.target === 'AreaWorkers')) {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`/api/areas/${user.city}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAreas(data.data || []);
        } catch (error) {
          toast.error("Could not load areas for your city.");
        }
      }
    };

    fetchAreas();
  }, [user?.city, formData.target]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // If the user changes the target away from area-based, reset the selected area
    if (name === 'target' && value !== 'AreaCitizens' && value !== 'AreaWorkers') {
      setFormData(prev => ({ ...prev, area: '' }));
    }
  };

  // --- THE FIX IS IN THIS FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Start building the payload that the backend API expects
    let payload = {
      title: formData.title,
      message: formData.message,
      targetCity: user?.city, // The officer can only notify their own city
      targetRole: '', // This will be determined by our "translator" logic below
    };

    // 2. This is the "translator". It converts the form's 'target' value
    //    into the 'targetRole' and area that the backend understands.
    switch (formData.target) {
      case 'Citizens':
        payload.targetRole = 'Citizen';
        break;
      case 'Workers':
        payload.targetRole = 'Worker';
        break;
      case 'All':
        payload.targetRole = 'All'; // Special handling in backend
        break;
      case 'AreaCitizens':
        payload.targetRole = 'Citizen';
        payload.targetArea = formData.area;
        payload.message = `[Alert for ${formData.area}]: ${formData.message}`;
        break;
      case 'AreaWorkers':
        payload.targetRole = 'Worker';
        payload.targetArea = formData.area;
        payload.message = `[Alert for ${formData.area}]: ${formData.message}`;
        break;
      default:
        payload.targetRole = 'Citizen';
    }

    try {
      const token = localStorage.getItem('token');
      // 3. Send the correctly structured 'payload' object to the backend
      const { data } = await axios.post('/api/notifications', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message || 'Notification sent successfully!');
      setFormData({ title: '', message: '', target: 'All', area: '' }); // Reset form
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send notification.');
    } finally {
        setLoading(false);
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
            <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="e.g., The waste collection vehicle will be delayed by 2 hours today..." required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="target">Send To</label>
            <select name="target" value={formData.target} onChange={handleChange} required>
              <option value="All">All Users (City-Wide Campaign)</option>
              <option value="Citizens">All Citizens in {user?.city}</option>
              <option value="Workers">All Workers in {user?.city}</option>
              <option value="AreaCitizens">A Specific Area (Citizens)</option>
              <option value="AreaWorkers">A Specific Area (Workers)</option>
            </select>
          </div>
          {(formData.target === 'AreaCitizens' || formData.target === 'AreaWorkers') && (
            <div className="form-group">
              <label htmlFor="area">Select Area</label>
              <select name="area" value={formData.area} onChange={handleChange} required>
                <option value="">-- Select an Area --</option>
                {areas.map(areaObj => <option key={areaObj._id} value={areaObj.name}>{areaObj.name}</option>)}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
            {loading ? 'Sending...' : <><FaBullhorn /> Broadcast Notification</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNotification;