import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell, FaTrash, FaInfoCircle, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { parseMessage } from '../../../utils/parseMessage';
import { getImageUrl } from '../../../utils/getImageUrl';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/notification.png';
import './Notifications.css';

const Notifications = () => {
  useScrollToTop();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/notifications/my-notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not load notifications.");
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleDeleteNotification = async (notificationId) => {
    const originalNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/notifications/${notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Notification deleted.");
    } catch (error) {
      toast.error("Failed to delete. Please try again.");
      setNotifications(originalNotifications);
    }
  };

  const handleVote = async (complaintId, voteType) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`/complaints/${complaintId}/vote`, { voteType }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Thank you for your vote!');
        // Mark this notification as "voted" locally to disable buttons
        setNotifications(prev => prev.map(n => 
            n.relatedComplaint?._id === complaintId ? { ...n, voted: true } : n
        ));
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to cast vote.");
    }
  };

  const parseMessage = (message) => {
    const linkToken = '__LINK_TO_COMPLAINT_HISTORY__';
    const textParts = message.split(linkToken);
    return { textParts };
  };

  if (loading) return <Loader text="Loading notifications..." />;

  return (
    <div className="notifications-page container fade-in">
      <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
        <h1>Notifications</h1>
        <p>Stay updated and vote on new issues in your community.</p>
      </header>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <FaInfoCircle style={{ fontSize: '2rem', color: '#6c757d', marginBottom: '1rem' }} />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          notifications.map(notif => {
            const { textParts } = parseMessage(notif.message);
            const complaint = notif.relatedComplaint;

            return (
              <div key={notif._id} className="notification-item card">
                <FaBell className="notification-icon" />
                <div className="notification-content">
                  <h4>{notif.title}</h4>
                  <p>
                    {textParts[0]}
                    {textParts.length > 1 && (<Link to="/citizen/profile" className="notification-link">Complaint History</Link>)}
                    {textParts[1]}
                  </p>
                  
                  {notif.type === 'Broadcast' && complaint && (
                    <div className="complaint-details-section">
                      <p><strong>Description:</strong> {complaint.description}</p>
                      
                      {notif.type === 'Broadcast' && complaint && complaint.reportedBy === user?._id && (
                        <div className="citizen-voting-section">
                          <p className="voting-prompt" style={{color: '#666', fontStyle: 'italic'}}>You reported this issue. You cannot vote on it.</p>
                        </div>
                      )}

                      {notif.type === 'Broadcast' && complaint && complaint.status === 'AwaitingApproval' && complaint.reportedBy !== user?._id && (
                        <div className="citizen-voting-section">
                          <p className="voting-prompt">Is this issue authentic?</p>
                          <div className="voting-buttons">
                            <button
                              className="btn-vote btn-like"
                              onClick={() => handleVote(complaint._id, 'like')}
                              disabled={complaint.votedBy?.includes(user?._id)}
                            >
                              <FaThumbsUp /> Yes ({complaint.likes || 0})
                            </button>
                            <button
                              className="btn-vote btn-dislike"
                              onClick={() => handleVote(complaint._id, 'dislike')}
                              disabled={complaint.votedBy?.includes(user?._id)}
                            >
                              <FaThumbsDown /> No ({complaint.dislikes || 0})
                            </button>
                          </div>
                        </div>
                      )}

                      {complaint.imageUrl && (
                        <div className="complaint-image-preview mt-3">
                          <a href={getImageUrl(complaint.imageUrl)} target="_blank" rel="noopener noreferrer">
                            <img src={getImageUrl(complaint.imageUrl)} alt="Issue reported by a citizen" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <small>{new Date(notif.createdAt).toLocaleString()}</small>

                </div>
                <button className="delete-notification-btn" onClick={() => handleDeleteNotification(notif._id)} title="Delete Notification"><FaTrash /></button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;