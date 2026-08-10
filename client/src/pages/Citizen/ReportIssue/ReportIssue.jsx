import React, { useState, useEffect } from 'react';
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
        description: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const sensorId = searchParams.get('sensorId');
        const area = searchParams.get('area');
        const category = searchParams.get('category');
        
        if (sensorId || category) {
            setFormData(prev => ({
                ...prev,
                issueType: category || 'Other',
                description: sensorId ? `Issue at sensor ${sensorId} in ${area || 'unknown area'}. ` : ''
            }));
            // Optionally auto-open camera here if desired, but user can click it.
        }
    }, []);

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
        data.append('description', formData.description);
        data.append('photo', image);

        try {
            setLoading(true);

            // Fetch Geolocation
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported by your browser'));
                } else {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                }
            });

            data.append('lat', position.coords.latitude);
            data.append('lng', position.coords.longitude);

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
                description: ''
            });
            setImage(null);
            setPreview(null);

            // Navigate to history or stay
            navigate('/citizen/dashboard');

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
                    
                    {/* CAMERA / UPLOAD FIRST */}
                    <div className="form-group" style={{ marginBottom: preview ? '1rem' : '0' }}>
                        <label style={{ fontSize: '1.2rem', textAlign: 'center', display: 'block', marginBottom: '15px' }}>
                            {preview ? "Proof Image Attached" : "Step 1: Capture the Issue"}
                        </label>
                        {!preview && (
                            <div className="file-input-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <label htmlFor="cameraInput" className="btn-file-input" style={{ padding: '15px', fontSize: '1.2rem', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                    <FaCloudUploadAlt /> Take Photo (Camera)
                                </label>
                                <input
                                    type="file"
                                    id="cameraInput"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />

                                <label htmlFor="galleryInput" className="btn-file-input" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
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
                        )}

                        {preview && (
                            <div className="image-preview-container" style={{ position: 'relative' }}>
                                <img src={preview} alt="Evidence Preview" className="image-preview" />
                                <button 
                                    type="button" 
                                    onClick={() => { setImage(null); setPreview(null); }}
                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
                                >
                                    X
                                </button>
                            </div>
                        )}
                    </div>

                    {/* REST OF FORM APPEARS ONLY AFTER IMAGE IS SELECTED */}
                    {preview && (
                        <div className="fade-in">
                            <div className="form-group">
                                <label htmlFor="issueType">Step 2: Issue Type</label>
                                <select
                                    id="issueType"
                                    name="issueType"
                                    value={formData.issueType}
                                    onChange={handletextChange}
                                >
                                    <option value="Overflowing Bin">Overflowing Bin</option>
                                    <option value="Damaged Bin">Damaged Bin</option>
                                    <option value="Waste Spilled Nearby">Waste Spilled Nearby</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Drainage">Drainage</option>
                                    <option value="Pothole">Pothole</option>
                                    <option value="Streetlight Issue">Streetlight Issue</option>
                                    <option value="Water Leakage">Water Leakage</option>
                                    <option value="Air Quality">Air Quality</option>
                                    <option value="Traffic">Traffic</option>
                                    <option value="Fallen Tree">Fallen Tree</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Step 3: Description (Optional)</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handletextChange}
                                    rows="3"
                                    placeholder="Describe the issue..."
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-submit" style={{ marginTop: '20px' }}>
                                Submit Report
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;