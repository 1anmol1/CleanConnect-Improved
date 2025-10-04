import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { FaPaperPlane } from 'react-icons/fa';
import dashboardHeroImage from '/src/assets/issue.png';
import './ReportIssue.css';

const ReportIssue = () => {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState('');
  const [formData, setFormData] = useState({ binId: '', description: '' });
  const [photo, setPhoto] = useState(null);
  const [binSuggestions, setBinSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleIssueChange = (e) => setIssueType(e.target.value);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setPhoto(e.target.files[0]);

  const handleBinIdChange = async (e) => {
    const term = e.target.value;
    setFormData(prev => ({ ...prev, binId: term }));
    if (term.length > 2) {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`/api/bins/search?term=${term}`, { headers: { Authorization: `Bearer ${token}` } });
            setBinSuggestions(data.data.map(bin => bin.binId));
        } catch (error) {
            console.error("Bin search failed", error);
        }
    } else {
        setBinSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
        toast.error("Please upload a photo as proof of the issue.");
        return;
    }
    setLoading(true);

    // THE FIX: Use FormData to properly handle file uploads
    const submissionData = new FormData();
    submissionData.append('issueType', issueType);
    submissionData.append('binId', formData.binId);
    submissionData.append('description', formData.description);
    submissionData.append('photo', photo); // 'photo' must match the backend middleware

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/complaints', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data', // This header is crucial
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(data.message || 'Report submitted successfully!');
      // Reset the form on success
      e.target.reset();
      setIssueType('');
      setFormData({ binId: '', description: '' });
      setPhoto(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-issue-page container fade-in"> 
      <header 
        className="page-header"
        style={{ backgroundImage: `url(${dashboardHeroImage})` }}
      >
        <h1>Lodge a Grievance</h1>
        <p>Help us keep your city clean by providing details below.</p>
      </header>
      <div className="report-form-card">
        <div className="form-header">
            <h2>New Complaint Form</h2>
            <Link to="/citizen/profile" className="btn btn-secondary">View My Reports</Link>
        </div>
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="issueType">Type of Issue</label>
            <select id="issueType" name="issueType" value={issueType} onChange={handleIssueChange} required>
              <option value="">-- Please select an issue --</option>
              <option value="Overflowing Bin">Bin Overflowing</option>
              <option value="Damaged Bin">Bin is Damaged</option>
              <option value="Waste Spilled Nearby">Waste Spilled Nearby</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {(issueType === 'Overflowing Bin' || issueType === 'Damaged Bin') && (
            <div className="form-group">
              <label htmlFor="binId">Bin ID (if known)</label>
              <input type="text" id="binId" name="binId" value={formData.binId} onChange={handleBinIdChange} placeholder="Type to search for Bin ID..." list="bin-suggestions" required />
              <datalist id="bin-suggestions">
                {binSuggestions.map(id => <option key={id} value={id} />)}
              </datalist>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Provide more details about the issue..." required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="photo">Upload a Photo (Required)</label>
            <input type="file" id="photo" name="photo" onChange={handleFileChange} accept="image/*" required />
          </div>
          <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : <><FaPaperPlane /> Submit Report</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
