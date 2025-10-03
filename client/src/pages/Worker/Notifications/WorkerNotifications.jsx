import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/notification.png';
import './WorkerNotifications.css';

const WorkerNotifications = () => {
  const { user } = useAuth();
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
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);
  
  const timeSince = (date) => new Date(date).toLocaleDateString();


  if (loading) return <Loader text="Loading notifications..." />;
  
  return (
    <div className="notifications-page container fade-in">
      <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
        <h1>Your Notifications</h1>
        <p>Stay updated with operational alerts and city news.</p>
      </header>
      <div className="notifications-list">
        {notifications.length > 0 ? notifications.map(notif => (
          <div key={notif._id} className="notification-item card">
            <FaBell className="notification-icon" />
            <div className="notification-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <small>{timeSince(notif.createdAt)}</small>
            </div>
          </div>
        )) : <div className="card" style={{textAlign: 'center'}}><p>You have no notifications.</p></div>}
      </div>
    </div>
  );
};

export default WorkerNotifications;