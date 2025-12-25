import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaStar, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth.js';
import Loader from '../Loader/Loader.jsx';
import profileImage from '../../assets/profile.jpg';
import '../../pages/Citizen/Profile/Profile.css'; // Reuse existing styles

const ProfileOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ points: 0, reportsMade: 0, badges: [] });
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
        console.error("Failed to fetch user stats", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);
  
  if (loading) return <Loader text="Loading profile stats..." />;

  return (
    <div className="profile-container fade-in">
      <div className="profile-header">
        <img src={profileImage} alt="User Avatar" className="profile-avatar" />
        <h2>{user?.name}'s Dashboard</h2>
        {stats.badges.map(badge => <span key={badge} className="profile-badge">{badge}</span>)}
      </div>
      <div className="profile-stats">
        <div className="stat-card"><FaStar className="stat-icon" /><h3>Points Earned</h3><p className="stat-value">{stats.points}</p></div>
        <div className="stat-card"><FaTrophy className="stat-icon" /><h3>Badges Unlocked</h3><p className="stat-value">{stats.badges.length}</p></div>
        <div className="stat-card"><FaHistory className="stat-icon" /><h3>Reports Made</h3><p className="stat-value">{stats.reportsMade}</p></div>
      </div>
    </div>
  );
};

export default ProfileOverview;