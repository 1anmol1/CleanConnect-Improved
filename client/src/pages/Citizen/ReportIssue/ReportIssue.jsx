import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaPaperPlane, FaCamera, FaImage } from 'react-icons/fa';
import dashboardHeroImage from '/src/assets/issue.png';
import './ReportIssue.css';
import QrReportFlow from '../../../components/Report/QrReportFlow';

const ReportIssue = () => {
  useScrollToTop();
  const [searchParams] = useSearchParams();
  const qrBinId = searchParams.get('binId');
  const location = useLocation();

  if (qrBinId) {
    return <QrReportFlow qrBinId={qrBinId} />;
  }

  // --- MANUAL REPORT FORM LOGIC ---
  const [issueType, setIssueType] = useState('');
  const [formData, setFormData] = useState({ binId: '', description: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [allBins, setAllBins] = useState([]); // State to hold all bins for the dropdown
  const [loading, setLoading] = useState(false);
  
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // --- DATA FETCHING & AI PRE-FILL ---
  useEffect(() => {
    // Fetch all bins to populate the dropdown menu
    const fetchBins = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/bins', { headers: { Authorization: `Bearer ${token}` } });
        if (data.success && Array.isArray(data.data.bins)) {
          setAllBins(data.data.bins);
        }
      } catch (error) {
        console.error("Failed to fetch bin list for dropdown", error);
        toast.error("Could not load bin list.");
      }
    };
    fetchBins();

    // Handle pre-filling data if sent from the AI chatbot
    if (location.state) {
      setIssueType(location.state.issueType || '');
      setFormData(prevData => ({
        ...prevData,
        description: location.state.description || '',
        binId: location.state.binId || ''
      }));
      toast.info("AI has pre-filled the form based on your conversation.");
    }
  }, [location.state]);

  const handleIssueChange = (e) => setIssueType(e.target.value);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
    if (!recaptchaToken) {
        toast.error("Please verify that you are not a robot.");
        return;
    }
    if (!photo) { toast.error("Please provide a photo."); return; }
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
      
      // Reset form state after successful submission
      e.target.reset();
      setIssueType('');
      setFormData({ binId: '', description: '' });
      setPhoto(null);
      setPhotoPreview(null);
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
          
          {/* --- UPDATED BIN ID DROPDOWN --- */}
          {(issueType === 'Overflowing Bin' || issueType === 'Damaged Bin') && (
            <div className="form-group">
              <label htmlFor="binId">Bin ID (if known)</label>
              <select id="binId" name="binId" value={formData.binId} onChange={handleChange} required>
                <option value="">-- Select a Bin ID --</option>
                {allBins.map(bin => (
                  <option key={bin._id} value={bin.binId}>
                    {bin.binId} ({bin.area})
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* --- END OF UPDATE --- */}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" required></textarea>
          </div>
          
          <div className="form-group">
            <label>Attach a Photo (Required)</label>
            <div className="file-input-buttons">
              <button type="button" className="btn-file-input" onClick={() => fileInputRef.current.click()}>
                <FaImage /> Choose from Library
              </button>
              <button type="button" className="btn-file-input" onClick={() => cameraInputRef.current.click()}>
                <FaCamera /> Take a Photo
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" style={{ display: 'none' }} />
            
            {photoPreview && (
              <div className="image-preview-container">
                <img src={photoPreview} alt="Selected preview" className="image-preview" />
              </div>
            )}
          </div>

          <div className="form-group recaptcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-submit" disabled={loading || !photo}>
            {loading ? 'Submitting...' : <><FaPaperPlane /> Submit Report</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;