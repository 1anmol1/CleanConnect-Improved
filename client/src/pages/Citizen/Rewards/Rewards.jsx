import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';
import { GiTwoCoins } from "react-icons/gi";
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import RedeemModal from '../../../components/Modals/RedeemModal.jsx';
import dashboardHeroImage from '/src/assets/rewards.png';
import './Rewards.css';

const Rewards = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({ cleanCoins: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [leaderboardRes, statsRes] = await Promise.all([
          axios.get('/users/leaderboard', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/users/stats', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setLeaderboard(leaderboardRes.data.data);
        setUserStats(statsRes.data.data);
      } catch (error) {
        console.error("Failed to fetch rewards data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

    if (loading) {
    return <Loader text="Loading rewards..." />;
  }

  return (
    <>
      <div className="rewards-page container fade-in">
        <header className="page-header" style={{ backgroundImage: `url(${dashboardHeroImage})` }}>
          <h1>CleanCoin Rewards</h1>
          <p>Earn coins for responsible citizenship and climb the ranks!</p>
        </header>
        <div className="rewards-grid">
          <div className="card points-card">
            <GiTwoCoins className="card-icon cleancoin-icon" />
            <h3>Your CleanCoins</h3>
            <p className="points-total cleancoin-total">{userStats.cleanCoins}</p>
            <button className="btn btn-redeem-gold" onClick={() => setIsModalOpen(true)}>Redeem CleanCoins</button>
          </div>
          <div className="card leaderboard-card">
            <FaUsers className="card-icon" />
            <h3>Community Leaderboard</h3>
            <ul className="leaderboard-list">
              {leaderboard.map((player, index) => (
                <li key={player._id} className={player.name === user.name ? 'current-user' : ''}>
                  <span>{index + 1}. {player.name}</span>
                  <span className="leaderboard-coins">{player.cleanCoins} Coins</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <RedeemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        currentCoins={userStats.cleanCoins}
      />
    </>
  );
};

export default Rewards;