import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import Loader from '../../components/Loader/Loader'; // It's good practice to use a loader
import './ComplaintHistory.css';

const ComplaintHistory = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({});

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            
            const token = localStorage.getItem('token');
            // FIX 1: Add a check to see if the token exists before making the call.
            if (!token) {
                toast.error("You are not logged in. Cannot fetch history.");
                setLoading(false);
                return;
            }

            try {
                console.log("Fetching complaint history with token...");
                const { data } = await axios.get('/api/complaints/my-history', { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                // FIX 2: Add console logs to see exactly what data we receive.
                console.log("API Response Received:", data);

                if (Array.isArray(data.data)) {
                    setComplaints(data.data);
                    if (data.data.length === 0) {
                        console.log("API returned an empty array. The user has no complaints or there's a backend logic issue.");
                    }
                } else {
                    setComplaints([]);
                    console.error("API did not return an array of complaints. Response:", data);
                }

            } catch (error) {
                toast.error("Could not fetch your complaint history.");
                // FIX 3: Log the detailed error from the backend.
                console.error("Error fetching complaint history:", error.response ? error.response.data : error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []); // This should only run once when the component mounts.

    // --- The rest of your functions (handleFeedbackChange, etc.) remain the same ---

    const handleFeedbackChange = (id, key, value) => {
        setFeedback(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    };

    const handleFeedbackSubmit = async (id) => {
        const payload = feedback[id];
        if (!payload || !payload.satisfaction) {
            toast.warn('Please select thumbs up or down.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${id}/feedback`, payload, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Thank you for your feedback!`);
            // Re-fetch history to show updated state
            const { data } = await axios.get('/api/complaints/my-history', { headers: { Authorization: `Bearer ${token}` } });
            setComplaints(data.data || []);
        } catch (error) {
            toast.error("Failed to submit feedback.");
        }
    };

    if (loading) return <Loader text="Loading complaint history..." />;

    return (
        <div className="complaint-history">
            <h2>Your Complaint History</h2>
            {complaints.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>You haven't reported any issues yet.</p>
                </div>
            ) : (
                complaints.map(c => (
                    <div className="history-item card" key={c._id}>
                        <div className="history-item-header">
                            <h4>{c.issueType}</h4>
                            <span className={`status-badge status-${c.status?.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                        </div>
                        
                        <div className="info-grid">
                            <div className="info-item"><span>Bin ID</span><p>{c.binId || 'N/A'}</p></div>
                            <div className="info-item"><span>Reported On</span><p>{new Date(c.createdAt).toLocaleString()}</p></div>
                            <div className="info-item"><span>Proof Received</span><p>{c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : 'Pending'}</p></div>
                        </div>
                        
                        <p className="description-text">{c.description}</p>
                        
                        {c.status === 'Verified' && (
                            <div className="feedback-section">
                                {c.resolutionImageUrl && (
                                    <div className="proof-image-container">
                                        <p className="proof-title"><strong>Resolution Proof:</strong></p>
                                        <a href={`http://localhost:5000${c.resolutionImageUrl}`} target="_blank" rel="noopener noreferrer">
                                            <img className="proof-image" src={`http://localhost:5000${c.resolutionImageUrl}`} alt="Proof of resolution" />
                                        </a>
                                    </div>
                                )}

                                <p className="feedback-prompt">Was this issue resolved to your satisfaction?</p>
                                <div className="feedback-controls">
                                    <div className="thumbs-container">
                                        <button 
                                            className={`thumb-btn ${feedback[c._id]?.satisfaction === 'Positive' ? 'active-up' : ''}`}
                                            onClick={() => handleFeedbackChange(c._id, 'satisfaction', 'Positive')}>
                                            <FaThumbsUp />
                                        </button>
                                        <button 
                                            className={`thumb-btn ${feedback[c._id]?.satisfaction === 'Negative' ? 'active-down' : ''}`}
                                            onClick={() => handleFeedbackChange(c._id, 'satisfaction', 'Negative')}>
                                            <FaThumbsDown />
                                        </button>
                                    </div>
                                    <textarea 
                                        placeholder="Add an optional comment..." 
                                        onChange={(e) => handleFeedbackChange(c._id, 'comment', e.target.value)}
                                    />
                                    <button className="btn btn-primary btn-small" onClick={() => handleFeedbackSubmit(c._id)}>Submit Feedback</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default ComplaintHistory;