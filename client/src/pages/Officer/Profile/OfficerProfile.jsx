import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import profileImage from '/src/assets/profile.jpg';
import './OfficerProfile.css';

const OfficerProfile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ workersManaged: 0, complaintsVerified: 0, pendingComplaints: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/users/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data.data);
      } catch (error) {
        console.error("Failed to fetch officer stats", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) {
    return <Loader text="Loading officer profile..." />;
  }

  return (
    <div className="profile-container container fade-in">
      <div className="profile-header">
        <img src={profileImage} alt="Officer Avatar" className="profile-avatar" />
        <h2>{user?.name}'s Profile</h2>
        <span className="profile-badge">Operations Head</span>
      </div>
      <div className="profile-stats">
        <div className="stat-card"><FaUsers className="stat-icon" /><h3>Workers Managed</h3><p className="stat-value">{stats.workersManaged}</p></div>
        <div className="stat-card"><FaCheckCircle className="stat-icon" /><h3>Complaints Verified</h3><p className="stat-value">{stats.complaintsVerified}</p></div>
        <div className="stat-card"><FaExclamationCircle className="stat-icon" /><h3>Pending Complaints</h3><p className="stat-value">{stats.pendingComplaints}</p></div>
      </div>
    </div>
  );
};

export default OfficerProfile;