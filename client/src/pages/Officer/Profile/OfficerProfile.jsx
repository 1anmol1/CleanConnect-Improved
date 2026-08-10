import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { FaUsers, FaCheckCircle, FaExclamationCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import profileImage from '/src/assets/profile.jpg';
import './OfficerProfile.css';

const OfficerProfile = () => {
  useScrollToTop();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ workersManaged: 0, complaintsVerified: 0, pendingComplaints: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/users/stats', {
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
    <div className="profile-container container fade-in" style={{ position: 'relative' }}>
      
      {/* Mobile Logout Button positioned top-right */}
      <button 
        onClick={logout} 
        className="logout-mobile-btn-absolute" 
        style={{ 
          display: 'none', 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          backgroundColor: '#fff', 
          color: 'var(--nav-danger-color)', 
          border: '1px solid var(--nav-danger-color)', 
          padding: '8px 15px', 
          borderRadius: '6px', 
          fontSize: '0.9rem', 
          zIndex: 10 
        }}
      >
        <FaSignOutAlt style={{ marginRight: '5px' }} /> Logout
      </button>

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