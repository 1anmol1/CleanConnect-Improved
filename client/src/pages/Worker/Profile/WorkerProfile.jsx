import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { FaClipboardCheck, FaTasks, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import profileImage from '/src/assets/profile.jpg';
import './WorkerProfile.css';

const WorkerProfile = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [stats, setStats] = useState({ resolvedTasks: 0, assignedTasks: 0, efficiency: '0%' });
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
        console.error("Failed to fetch worker stats", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);
  
  if (loading) {
    return <Loader text="Loading worker profile..." />;
  }

  return (
    <div className="profile-container container fade-in">
      <div className="profile-header">
        <img src={profileImage} alt="Worker Avatar" className="profile-avatar" />
        <h2>{user?.name}'s Profile</h2>
        <span className="profile-badge">Sanitation Specialist</span>
      </div>
      <div className="profile-stats">
        <div className="stat-card"><FaClipboardCheck className="stat-icon" /><h3>Tasks Resolved</h3><p className="stat-value">{stats.resolvedTasks}</p></div>
        <div className="stat-card"><FaTasks className="stat-icon" /><h3>Total Assigned</h3><p className="stat-value">{stats.assignedTasks}</p></div>
        <div className="stat-card"><FaChartLine className="stat-icon" /><h3>Efficiency Rating</h3><p className="stat-value">{stats.efficiency}</p></div>
      </div>
    </div>
  );
};

export default WorkerProfile;