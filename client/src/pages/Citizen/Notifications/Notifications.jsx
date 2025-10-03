import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/notification.png';
import './Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  // THE FIX IS ON THIS LINE: Changed '_useState' to '= useState'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/notifications/my-notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(data.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        toast.error("Could not load notifications.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const handleDeleteNotification = async (notificationId) => {
    const originalNotifications = [...notifications];
    setNotifications(prevNotifications => prevNotifications.filter(n => n._id !== notificationId));

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Notification deleted.");
    } catch (error) {
      toast.error("Failed to delete notification. Please try again.");
      setNotifications(originalNotifications);
      console.error("Failed to delete notification", error);
    }
  };

  const parseMessage = (message) => {
    const urlRegex = /(https?:\/\/[^\s]+(\.png|\.jpg|\.jpeg|\.gif))/g;
    const linkToken = '__LINK_TO_COMPLAINT_HISTORY__';
    
    let imageUrl = null;
    let textWithToken = message.replace(urlRegex, (url) => {
      imageUrl = url;
      return '';
    }).replace('Proof Image:', '').trim();

    const textParts = textWithToken.split(linkToken);
    
    return { textParts, imageUrl };
  };

  if (loading) {
    return <Loader text="Loading notifications..." />;
  }

  return (
    <div className="notifications-page container fade-in">
      <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
        <h1>Notifications</h1>
        <p>Stay updated with local news and alerts.</p>
      </header>
      <div className="notifications-list">
        {notifications.length > 0 ? notifications.map(notif => {
          const { textParts, imageUrl } = parseMessage(notif.message);
          return (
            <div key={notif._id} className="notification-item card">
              <FaBell className="notification-icon" />
              <div className="notification-content">
                <h4>{notif.title}</h4>
                <p>
                  {textParts[0]}
                  {textParts.length > 1 && (
                    <Link to="/citizen/profile" className="notification-link">Complaint History</Link>
                  )}
                  {textParts[1]}
                </p>
                {imageUrl && (
                  <div className="notification-image-container">
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Resolution Proof" />
                    </a>
                  </div>
                )}
                <small>{new Date(notif.createdAt).toLocaleString()}</small>
              </div>
              <button 
                className="delete-notification-btn" 
                onClick={() => handleDeleteNotification(notif._id)}
                title="Delete Notification"
              >
                <FaTrash />
              </button>
            </div>
          );
        }) : <div className="card" style={{ textAlign: 'center' }}><p>You have no notifications.</p></div>}
      </div>
    </div>
  );
};

export default Notifications;