import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTasks, FaCheck, FaThumbsUp, FaThumbsDown, FaTrash, FaUndo, FaEye } from 'react-icons/fa'; // 1. Import FaEye icon
import { useAuth } from '../../../hooks/useAuth.js';
import VerifyResolutionModal from '../../../components/Modals/VerifyResolutionModal.jsx';
import ReassignModal from '../../../components/Modals/ReassignModal.jsx';
import ViewFeedbackModal from '../../../components/Modals/ViewFeedbackModal.jsx';
import ImageViewerModal from '../../../components/Modals/ImageViewerModal.jsx'; // 2. Import the new Image Viewer Modal
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/manage.png';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
    useScrollToTop();
    const [complaints, setComplaints] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaints, setSelectedComplaints] = useState([]);
    
    // State for managing modals
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false); // 3. New state for the image viewer
    
    // State to hold the specific complaint being acted upon by a modal
    const [selectedTask, setSelectedTask] = useState(null);
    const { user } = useAuth();

    // Fetches both complaints and workers from the backend
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [complaintsRes, workersRes] = await Promise.all([
                axios.get('/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/users/workers', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setComplaints(complaintsRes.data.data);
            setWorkers(workersRes.data.data);
        } catch (error) {
            toast.error("Failed to load management data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    // --- Action Handlers for Buttons ---

    const handleAssign = async (complaintId, workerId) => {
        if (!workerId) {
            toast.warn('Please select a worker to assign.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${complaintId}/assign`, { workerId }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Complaint assigned successfully!');
            fetchData(); // Refresh data to show the update
        } catch (error) { toast.error('Failed to assign complaint.'); }
    };

    const handleVerification = async (complaintId, status) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`/api/complaints/${complaintId}/verify`, { status }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            toast.success(data.message);
            setIsVerifyModalOpen(false);
            fetchData();
        } catch (error) { 
            toast.error(error.response?.data?.error || 'Verification failed.');
        }
    };

    const handleClose = async (complaintId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${complaintId}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Complaint finalized. CleanCoins awarded to the reporter(s).');
            fetchData();
        } catch (error) { toast.error('Failed to close complaint.'); }
    };

    const handleReassignSubmit = async (workerId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${selectedTask._id}/reassign`, { workerId }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Complaint has been re-assigned.');
            setIsReassignModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to re-assign complaint.');
        }
    };

    // 4. NEW: Frontend simulation for rejecting a complaint
    const handleRejectComplaint = (complaintId) => {
        // This is a simulation and does not talk to the backend.
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
        toast.warn(`Complaint ${complaintId.slice(-6)} has been rejected and removed from view.`);
    };

    // --- Selection and Modal Control ---

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedComplaints(complaints.map(c => c._id));
        } else {
            setSelectedComplaints([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedComplaints(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedComplaints.length} complaint(s)? This action cannot be undone.`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.post('/api/complaints/bulk-delete', { ids: selectedComplaints }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success(`${selectedComplaints.length} complaints deleted successfully.`);
                setSelectedComplaints([]);
                fetchData();
            } catch (error) {
                toast.error('Failed to delete complaints.');
            }
        }
    };

    const openModal = (modalSetter, task) => {
        setSelectedTask(task);
        modalSetter(true);
    };

    if (loading) return <Loader text="Loading complaint data..." />;

    return (
        <>
            <div className="complaint-management-page container fade-in">
                <header className="page-header"
                            style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
                    
                    <h1>Complaint Management</h1>
                    <p>Review and assign incoming sanitation reports for {user?.city}.</p>
                </header>

                <div className="table-actions-container">
                    {selectedComplaints.length > 0 && (
                        <button className="btn btn-danger" onClick={handleDeleteSelected}>
                            <FaTrash /> Delete Selected ({selectedComplaints.length})
                        </button>
                    )}
                </div>

                <div className="complaint-table-container card">
                    <table className="complaint-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" onChange={handleSelectAll} checked={complaints.length > 0 && selectedComplaints.length === complaints.length} /></th>
                                <th>Issue / Bin ID</th>
                                <th>Proof</th>
                                <th>Feedback</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.length === 0 ? (
                                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No complaints to display at the moment.</td></tr>
                            ) : (
                                complaints.map(c => (
                                    <tr key={c._id} className={selectedComplaints.includes(c._id) ? 'selected-row' : ''}>
                                        <td><input type="checkbox" onChange={() => handleSelectOne(c._id)} checked={selectedComplaints.includes(c._id)} /></td>
                                        <td className="issue-cell">
                                            {c.reportCount > 1 && <span className="report-count-badge">{c.reportCount}</span>}
                                            <strong>{c.issueType}</strong><br />
                                            <small className="bin-id-small">Bin ID: {c.binId || 'N/A'}</small>
                                        </td>
                                        {/* 5. NEW: "Proof" column with the "View Proof" button */}
                                        <td className="proof-cell">
                                            {c.imageUrl && (
                                                <button className="btn-view-proof" onClick={() => openModal(setIsImageViewerOpen, c)}>
                                                    <FaEye /> View Proof
                                                </button>
                                            )}
                                        </td>
                                        <td className="feedback-cell">
                                            <div className="feedback-counts">
                                                <span className="feedback-positive"><FaThumbsUp /> {c.positiveFeedbackCount || 0}</span>
                                                <span className="feedback-negative"><FaThumbsDown /> {c.negativeFeedbackCount || 0}</span>
                                            </div>
                                            {c.feedbacks?.length > 0 && (<span className="read-feedback-link" onClick={() => openModal(setIsFeedbackModalOpen, c)}>(Read feedbacks)</span>)}
                                        </td>
                                        <td>
                                            {c.status === 'Pending' ? (
                                                <select className="worker-assign-select" id={`worker-select-${c._id}`} defaultValue="">
                                                    <option value="" disabled>Select Worker</option>
                                                    {workers.map(w => <option key={w._id} value={w._id}>{w.name} ({w.area})</option>)}
                                                </select>
                                            ) : (
                                                <span>{c.assignedTo?.name || 'N/A'}</span>
                                            )}
                                        </td>
                                        <td className="status-action-cell">
                                            {c.status === 'Pending' ? (
                                                <button className="btn btn-primary btn-small" onClick={() => handleAssign(c._id, document.getElementById(`worker-select-${c._id}`).value)}><FaTasks /> Assign</button>
                                            ) : c.status === 'Resolved' ? (
                                                <button className="btn btn-success btn-small" onClick={() => openModal(setIsVerifyModalOpen, c)}><FaCheck /> Verify</button>
                                            ) : c.status === 'FeedbackProvided' ? (
                                                <button className="btn btn-primary btn-small" onClick={() => handleClose(c._id)}><FaCheck /> Finalize & Close</button>
                                            ) : c.status === 'Reopened' ? (
                                                <button className="btn btn-danger btn-small" onClick={() => openModal(setIsReassignModalOpen, c)}><FaUndo /> Re-assign</button>
                                            ) : (
                                                <button className={`btn btn-small btn-status-${c.status.toLowerCase()}`} disabled>{c.status}</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* 6. Render the new Image Viewer Modal */}
            <ImageViewerModal isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} onReject={handleRejectComplaint} complaint={selectedTask} />

            <VerifyResolutionModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} onVerify={handleVerification} task={selectedTask} />
            <ReassignModal isOpen={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)} workers={workers} onSubmit={handleReassignSubmit} />
            <ViewFeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} feedbacks={selectedTask?.feedbacks} />
        </>
    );
};

export default ComplaintManagement;