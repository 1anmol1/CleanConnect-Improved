import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Import useLocation
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../../components/Loader/Loader.jsx';
import { FaPaperPlane } from 'react-icons/fa'; // For the button icon
import dashboardHeroImage from '/src/assets/complain.png';
import './NewComplaint.css'; 

const NewComplaint = () => {
  useScrollToTop();
  const location = useLocation(); // 2. Initialize the hook
  const [issueType, setIssueType] = useState('');
  const [formData, setFormData] = useState({
    binId: '',
    description: '',
    photo: null,
  });
  const [loading, setLoading] = useState(false); // Add loading state

  // 3. THE FIX: This new useEffect runs once when the page loads.
  // It checks if the AI chatbot sent any data in the navigation state.
  useEffect(() => {
    // location.state will contain the { issueType, description } object from the AI
    if (location.state) {
      // Update the form's state with the data from the AI
      setIssueType(location.state.issueType || '');
      setFormData(prevData => ({
        ...prevData,
        description: location.state.description || ''
      }));
      // Let the user know the form was pre-filled
      toast.info("AI has pre-filled the form based on your conversation.");
    }
  }, [location.state]); // This dependency ensures the effect runs if the state changes

  const handleIssueChange = (e) => setIssueType(e.target.value);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setFormData(prev => ({ ...prev, photo: e.target.files[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Disable button on submit
    
    const submissionData = new FormData();
    submissionData.append('issueType', issueType);
    submissionData.append('binId', formData.binId);
    submissionData.append('description', formData.description);
    if (formData.photo) {
      submissionData.append('photo', formData.photo);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/complaints', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Issue reported successfully!');
      e.target.reset();
      setIssueType('');
      setFormData({ binId: '', description: '', photo: null });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit report.');
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div className="new-complaint-page container fade-in">
      <header 
        className="page-header"
        style={{ backgroundImage: `url(${dashboardHeroImage})` }}
      >
        <h1>Report a New Issue</h1>
        <p>Found a problem on your route? Report it here.</p>
      </header>

      <div className="form-card-container">
        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label htmlFor="issueType">Type of Issue</label>
            <select id="issueType" name="issueType" value={issueType} onChange={handleIssueChange} required>
              <option value="">-- Select an issue --</option>
              <option value="Roadblock">Roadblock</option>
              <option value="Damaged Bin">Damaged Bin</option>
              <option value="Public Waste Spill">Public Waste Spill</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {issueType === 'Damaged Bin' && (
            <div className="form-group">
              <label htmlFor="binId">Bin ID (if applicable)</label>
              <input type="text" id="binId" name="binId" value={formData.binId} onChange={handleChange} placeholder="e.g., PUNE-KTD-01" />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Provide more details and location..." required></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="photo">Upload Photo</label>
            <input type="file" id="photo" name="photo" onChange={handleFileChange} accept="image/*" />
          </div>

          <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : <><FaPaperPlane /> Submit Report</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewComplaint;