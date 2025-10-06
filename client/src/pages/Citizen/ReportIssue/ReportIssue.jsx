import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom'; // 1. Import useLocation
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaPaperPlane } from 'react-icons/fa';
import dashboardHeroImage from '/src/assets/issue.png';
import './ReportIssue.css';
import QrReportFlow from '../../../components/Report/QrReportFlow';

const ReportIssue = () => {
  useScrollToTop();
  const [searchParams] = useSearchParams();
  const qrBinId = searchParams.get('binId');
  const location = useLocation(); // 2. Initialize the hook to get navigation state

  // If a binId exists in the URL, render the QR code workflow component.
  if (qrBinId) {
    return <QrReportFlow qrBinId={qrBinId} />;
  }

  // --- MANUAL REPORT FORM LOGIC ---
  const [issueType, setIssueType] = useState('');
  const [formData, setFormData] = useState({ binId: '', description: '' });
  const [photo, setPhoto] = useState(null);
  const [binSuggestions, setBinSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

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
  }, [location.state]); // This dependency ensures the effect runs only when navigation state is present

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
      } catch (error) { console.error("Bin search failed", error); }
    } else {
      setBinSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
        toast.error("Please verify that you are not a robot.");
        return;
    }
    if (!photo) { toast.error("Please upload a photo."); return; }
    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('issueType', issueType);
    submissionData.append('binId', formData.binId);
    submissionData.append('description', formData.description);
    submissionData.append('photo', photo);
    submissionData.append('recaptchaToken', recaptchaToken);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/complaints', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      toast.success(data.message || 'Report submitted successfully!');
      e.target.reset();
      setIssueType('');
      setFormData({ binId: '', description: '' });
      setPhoto(null);
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit report.');
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-issue-page container fade-in"> 
      <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
        <h1>Report an Issue</h1>
        <p>Help us clean your city by reporting issues and earn rewards.</p>
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
              <input type="text" id="binId" name="binId" value={formData.binId} onChange={handleBinIdChange} placeholder="Type to search..." list="bin-suggestions" required />
              <datalist id="bin-suggestions">{binSuggestions.map(id => <option key={id} value={id} />)}</datalist>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="photo">Upload a Photo (Required)</label>
            <input type="file" id="photo" name="photo" onChange={handleFileChange} accept="image/*" required />
          </div>

          <div className="form-group recaptcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
            />
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