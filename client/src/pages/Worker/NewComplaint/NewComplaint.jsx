import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/complain.png';
import './NewComplaint.css'; 

const NewComplaint = () => {
  const [issueType, setIssueType] = useState('');
  const [formData, setFormData] = useState({
    binId: '',
    description: '',
    photo: null,
  });

  const handleIssueChange = (e) => setIssueType(e.target.value);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setFormData(prev => ({ ...prev, photo: e.target.files[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      toast.error('Failed to submit report.');
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
              <input type="text" id="binId" name="binId" value={formData.binId} onChange={handleChange} placeholder="e.g., ICK-01" />
            </div>
          )}
          
          {/* EDITED: Added a description field */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Provide more details about the issue..."></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="photo">Upload Photo</label>
            <input type="file" id="photo" name="photo" onChange={handleFileChange} accept="image/*" />
          </div>
          <button type="submit" className="btn btn-primary btn-submit">Submit Report</button>
        </form>
      </div>
    </div>
  );
};

export default NewComplaint;