import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa'; // Import FaCheckCircle for the text confirmation
import Loader from '../Loader/Loader.jsx';
import BinNotFullModal from '../Modals/BinNotFullModal.jsx';
import SuggestBinModal from '../Modals/SuggestBinModal.jsx';
import dashboardHeroImage from '/src/assets/issue.png';
import '../../pages/Citizen/ReportIssue/ReportIssue.css';

const QrReportFlow = ({ qrBinId }) => {
  const navigate = useNavigate();
  const [issueType, setIssueType] = useState('Overflowing Bin');
  const [formData, setFormData] = useState({ binId: qrBinId, description: 'Issue reported via QR Code Scan.' });
  const [photo, setPhoto] = useState(null);
  // The photoPreview state is now removed
  const [loading, setLoading] = useState(false);
  
  const [scannedBinData, setScannedBinData] = useState(null);
  const [isNotFullModalOpen, setIsNotFullModalOpen] = useState(false);
  const [isSuggestBinModalOpen, setIsSuggestBinModalOpen] = useState(false);
  
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  useEffect(() => {
    const fetchScannedBin = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/bins/by-id/${qrBinId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScannedBinData(data.data);
      } catch (error) {
        toast.error(`Could not retrieve data for Bin ID: ${qrBinId}`);
        navigate('/citizen/report', { replace: true });
      }
    };
    fetchScannedBin();
  }, [qrBinId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { 
      setPhoto(file);
      // We no longer create a preview URL
    }
  };
  
  const handleIssueChange = (e) => setIssueType(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
        toast.error("Please verify that you are not a robot.");
        return;
    }

    if (issueType === 'Overflowing Bin' && scannedBinData && scannedBinData.fillLevel < 95) {
      setIsNotFullModalOpen(true);
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
      await axios.post('/api/complaints', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      
      if (scannedBinData && scannedBinData.fillLevel >= 95) {
        setIsSuggestBinModalOpen(true);
      } else {
        toast.success('Report submitted successfully!');
        navigate('/citizen/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit report.');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (!scannedBinData) {
      return <Loader text={`Fetching details for Bin ID: ${qrBinId}...`} />;
  }

  return (
    <>
      <div className="report-issue-page container fade-in"> 
        <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
          <h1>Lodge a Grievance</h1>
          <p>Confirm the details of your report below.</p>
        </header>
        <div className="report-form-card">
          <div className="form-header"><h2>Report for Bin: {formData.binId}</h2></div>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label>Type of Issue</label>
              <select value={issueType} onChange={handleIssueChange} required>
                <option value="Overflowing Bin">Bin Overflowing</option>
                <option value="Damaged Bin">Bin is Damaged</option>
                <option value="Waste Spilled Nearby">Waste Spilled Nearby</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group"><label>Description</label><textarea value={formData.description} rows="4" readOnly></textarea></div>
            <div className="form-group">
              <label>Take a Photo as Proof</label>
              <input type="file" onChange={handleFileChange} accept="image/*" capture="environment" required />
              
              {/* THE CHANGE: Show a text confirmation instead of an image preview */}
              {photo && (
                <p className="image-selected-text">
                  <FaCheckCircle /> Image selected: {photo.name}
                </p>
              )}
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
      <BinNotFullModal isOpen={isNotFullModalOpen} onClose={() => setIsNotFullModalOpen(false)} />
      <SuggestBinModal isOpen={isSuggestBinModalOpen} onClose={() => navigate('/citizen/dashboard', { replace: true })} fullBinLocation={scannedBinData?.location} />
    </>
  );
};

export default QrReportFlow;

