import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTasks, FaCheck, FaBell, FaThumbsUp, FaThumbsDown, FaTrash, FaUndo } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import VerifyResolutionModal from '../../../components/Modals/VerifyResolutionModal.jsx';
import ReassignModal from '../../../components/Modals/ReassignModal.jsx';
import ViewFeedbackModal from '../../../components/Modals/ViewFeedbackModal.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaints, setSelectedComplaints] = useState([]);
    
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    
    const [selectedTask, setSelectedTask] = useState(null);
    const { user } = useAuth();

    // Status badge classes mapping
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'Pending': 'status-pending',
            'Assigned': 'status-assigned',
            'Resolved': 'status-resolved',
            'Verified': 'status-verified'
        };
        return `status-badge ${statusMap[status] || ''}`;
    };

    const fetchData = async () => {
        setLoading(true);
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
        if (user) fetchData();
    }, [user]);

    const handleAssign = async (complaintId, workerId) => {
        if (!workerId) {
            toast.warn('Please select a worker to assign.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${complaintId}/assign`, { workerId }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Complaint assigned successfully!');
            fetchData();
        } catch (error) { toast.error('Failed to assign complaint.'); }
    };

    const handleVerification = async (complaintId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${complaintId}/verify`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Resolution has been ${status.toLowerCase()}!`);
            setIsVerifyModalOpen(false);
            fetchData();
        } catch (error) { toast.error('Verification failed.'); }
    };

    const handleNotify = async (complaintId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/notifications/resolution', { complaintId }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Notification sent to reporters!`);
            fetchData();
        } catch (error) {
            toast.error('Failed to send notification.');
        }
    };

    const handleClose = async (complaintId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${complaintId}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Complaint closed. Reward points awarded to reporters.`);
            fetchData();
        } catch (error) { toast.error('Failed to close complaint.'); }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = complaints.map(c => c._id);
            setSelectedComplaints(allIds);
        } else {
            setSelectedComplaints([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedComplaints(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(item => item !== id)
                : [...prevSelected, id]
        );
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

    const openModal = (modalSetter, task) => {
        setSelectedTask(task);
        modalSetter(true);
    };

    if (loading) return <Loader text="Loading complaint data..." />;

    return (
        <>
            <div className="complaint-management-page container fade-in">
                <header className="page-header">
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
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={complaints.length > 0 && selectedComplaints.length === complaints.length}
                                    />
                                </th>
                                <th>Issue / Bin ID</th>
                                <th>Feedback</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(c => (
                                <tr key={c._id} className={selectedComplaints.includes(c._id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectOne(c._id)}
                                            checked={selectedComplaints.includes(c._id)}
                                        />
                                    </td>
                                    <td className="issue-cell" title={`${c.issueType} - Bin ID: ${c.binId || 'N/A'}`}>
                                        {c.reportCount > 1 && <span className="report-count-badge">{c.reportCount}</span>}
                                        <strong>{c.issueType}</strong>
                                        <br />
                                        <small className="bin-id-small">Bin ID: {c.binId || 'N/A'}</small>
                                    </td>
                                    <td className="feedback-cell">
                                        <div className="feedback-counts">
                                            <span className="feedback-positive"><FaThumbsUp /> {c.positiveFeedbackCount}</span>
                                            <span className="feedback-negative"><FaThumbsDown /> {c.negativeFeedbackCount}</span>
                                        </div>
                                        {c.feedbacks.length > 0 && (
                                            <span className="read-feedback-link" onClick={() => openModal(setIsFeedbackModalOpen, c)}>
                                                (Read feedbacks)
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {c.status === 'Pending' ? (
                                            <select className="worker-assign-select" id={`worker-select-${c._id}`}>
                                                <option value="">Select Worker</option>
                                                {workers.map(w => <option key={w._id} value={w._id}>{w.name} ({w.area})</option>)}
                                            </select>
                                        ) : (
                                            <span title={c.assignedTo?.name || 'N/A'}>{c.assignedTo?.name || 'N/A'}</span>
                                        )}
                                    </td>
                                    <td className="status-action-cell">
                                        {c.status === 'Pending' ? (
                                            <button className="btn btn-primary btn-small" onClick={() => handleAssign(c._id, document.getElementById(`worker-select-${c._id}`).value)}>
                                                <FaTasks /> Assign
                                            </button>
                                        ) : c.status === 'Resolved' ? (
                                            <button className="btn btn-success btn-small" onClick={() => openModal(setIsVerifyModalOpen, c)}><FaCheck /> Verify</button>
                                        ) : c.status === 'Verified' && !c.notifiedAt ? (
                                            <button className="btn btn-primary btn-small" onClick={() => handleNotify(c._id)}>
                                                <FaBell /> Notify
                                            </button>
                                        ) : c.status === 'FeedbackProvided' ? (
                                            <button className="btn btn-primary btn-small" onClick={() => handleClose(c._id)}><FaCheck /> Finalize & Close</button>
                                        ) : c.status === 'Reopened' ? (
                                            <button className="btn btn-danger btn-small" onClick={() => openModal(setIsReassignModalOpen, c)}>
                                                <FaUndo /> Re-assign
                                            </button>
                                        ) : (
                                            <button className={`btn btn-small btn-status-${c.status.toLowerCase()}`} disabled>
                                                {c.status}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <VerifyResolutionModal 
                isOpen={isVerifyModalOpen} 
                onClose={() => {
                    setIsVerifyModalOpen(false);
                    setSelectedTask(null);
                }} 
                onVerify={handleVerification} 
                task={selectedTask} 
            />
            <ReassignModal 
                isOpen={isReassignModalOpen} 
                onClose={() => {
                    setIsReassignModalOpen(false);
                    setSelectedTask(null);
                }} 
                workers={workers} 
                onSubmit={handleReassignSubmit} 
            />
            <ViewFeedbackModal 
                isOpen={isFeedbackModalOpen} 
                onClose={() => {
                    setIsFeedbackModalOpen(false);
                    setSelectedTask(null);
                }} 
                feedbacks={selectedTask?.feedbacks} 
            />
        </>
    );
};
export default ComplaintManagement;