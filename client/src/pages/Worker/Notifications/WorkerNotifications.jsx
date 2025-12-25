import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/notification.png';
import './WorkerNotifications.css';

const WorkerNotifications = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/notifications/my-notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(data.data);
      } catch (error) {
        // THE FIX: Provide a clear error message to the user if the API call fails.
        // This prevents the loader from getting stuck.
        toast.error(error.response?.data?.error || "Could not load notifications.");
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);
  
  // NEW FEATURE: Added delete functionality for workers
  const handleDeleteNotification = async (notificationId) => {
    const originalNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n._id !== notificationId));

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Notification deleted.");
    } catch (error) {
      toast.error("Failed to delete notification. Please try again.");
      setNotifications(originalNotifications); // Revert on failure
    }
  };

  const timeSince = (date) => new Date(date).toLocaleString();

  if (loading) return <Loader text="Loading notifications..." />;
  
  return (
    <div className="notifications-page container fade-in">
      <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
        <h1>Your Notifications</h1>
        <p>Stay updated with operational alerts and city news.</p>
      </header>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <FaInfoCircle style={{ fontSize: '2rem', color: '#6c757d', marginBottom: '1rem' }} />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif._id} className="notification-item card">
              <FaBell className="notification-icon" />
              <div className="notification-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <small>{timeSince(notif.createdAt)}</small>
              </div>
              {/* The new delete button */}
              <button 
                className="delete-notification-btn" 
                onClick={() => handleDeleteNotification(notif._id)}
                title="Delete Notification"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerNotifications;