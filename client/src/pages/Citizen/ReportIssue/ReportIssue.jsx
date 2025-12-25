import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaHistory } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/manage.png'; // Reusing the same hero image or another appropriate one
import { useAuth } from '../../../hooks/useAuth';
import './ReportIssue.css';

const ReportIssue = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        issueType: 'Overflowing Bin',
        binId: '',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handletextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            toast.error('Please upload an image of the issue.');
            return;
        }

        const data = new FormData();
        data.append('issueType', formData.issueType);
        data.append('binId', formData.binId);
        data.append('description', formData.description);
        data.append('photo', image);

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('/complaints', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Report submitted successfully! Waiting for community verification.');

            // Reset form
            setFormData({
                issueType: 'Overflowing Bin',
                binId: '',
                description: ''
            });
            setImage(null);
            setPreview(null);

            // Navigate to history or stay
            navigate('/citizen/my-reports');

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to submit report.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Submitting Report..." />;

    return (
        <div className="report-issue-page container fade-in">
            <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
                <h1>Report an Issue</h1>
                <p>Help keep {user?.city || 'your city'} clean by reporting sanitation issues.</p>
            </header>

            <div className="report-form-card">
                <div className="form-header">
                    <h2>New Report</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/citizen/my-reports')}>
                        <FaHistory /> My History
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="issueType">Issue Type</label>
                        <select
                            id="issueType"
                            name="issueType"
                            value={formData.issueType}
                            onChange={handletextChange}
                        >
                            <option value="Overflowing Bin">Overflowing Bin</option>
                            <option value="Damaged Bin">Damaged Bin</option>
                            <option value="Waste Spilled Nearby">Waste Spilled Nearby</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="binId">Bin ID (Optional)</label>
                        <input
                            type="text"
                            id="binId"
                            name="binId"
                            value={formData.binId}
                            onChange={handletextChange}
                            placeholder="Enter Bin ID (e.g., BIN-123)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handletextChange}
                            rows="4"
                            placeholder="Describe the issue..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Proof Image</label>
                        <div className="file-input-buttons">
                            <label htmlFor="cameraInput" className="btn-file-input">
                                <FaCloudUploadAlt /> Take Photo
                            </label>
                            <input
                                type="file"
                                id="cameraInput"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />

                            <label htmlFor="galleryInput" className="btn-file-input">
                                <FaCloudUploadAlt /> Upload from Gallery
                            </label>
                            <input
                                type="file"
                                id="galleryInput"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {preview && (
                            <div className="image-preview-container">
                                <img src={preview} alt="Evidence Preview" className="image-preview" />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary btn-submit">
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;