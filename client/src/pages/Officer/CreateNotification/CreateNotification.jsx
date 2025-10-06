import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Import the useLocation hook
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import { FaBullhorn } from 'react-icons/fa';
import '../../Shared/SharedForm.css';
import './CreateNotification.css';

const CreateNotification = () => {
  useScrollToTop();
  const location = useLocation(); // 2. Initialize the hook to get navigation state
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'All',
    area: ''
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  // 3. THE FIX: This new useEffect runs once when the page loads.
  // It checks if the AI chatbot sent any data in the navigation state.
  useEffect(() => {
    // location.state will contain the { title, message } object from the AI
    if (location.state) {
      // Update the form's state with the data from the AI
      setFormData(prevData => ({
        ...prevData,
        title: location.state.title || '',
        message: location.state.message || ''
      }));
      // Let the user know the form was pre-filled
      toast.info("AI has pre-filled the form based on your conversation.");
    }
  }, [location.state]); // This dependency ensures the effect runs if the state changes

  // This useEffect for fetching areas remains the same
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
    if (name === 'target' && value !== 'AreaCitizens' && value !== 'AreaWorkers') {
      setFormData(prev => ({ ...prev, area: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let payload = {
      title: formData.title,
      message: formData.message,
      targetCity: user?.city,
      targetRole: '',
    };

    switch (formData.target) {
      case 'Citizens':
        payload.targetRole = 'Citizen';
        break;
      case 'Workers':
        payload.targetRole = 'Worker';
        break;
      case 'All':
        payload.targetRole = 'All';
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
      const { data } = await axios.post('/api/notifications', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message || 'Notification sent successfully!');
      setFormData({ title: '', message: '', target: 'All', area: '' });
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
            <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="e.g., The waste collection vehicle will be delayed..." required></textarea>
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