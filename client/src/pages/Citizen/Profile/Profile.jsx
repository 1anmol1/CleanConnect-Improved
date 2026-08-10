import React, { useState } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import { FaTrophy, FaHistory, FaUserEdit, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import ComplaintHistory from '../../../components/Profile/ComplaintHistory';
import ProfileOverview from '../../../components/Profile/ProfileOverview';
import './Profile.css';

const Profile = () => {
  useScrollToTop();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="profile-page-layout">
      {/* This is the mobile-first top navigation bar */}
      <nav className="profile-top-nav">
        <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>
          <FaTrophy /> <span>Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>
          <FaHistory /> <span>History</span>
        </button>
        <button disabled>
          <FaUserEdit /> <span>Edit Profile</span>
        </button>
      </nav>

      {/* This is the desktop sidebar */}
      <aside className="profile-sidebar">
        <nav>
          <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>
            <FaTrophy /> My Dashboard
          </button>
          <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>
            <FaHistory /> Complaint History
          </button>
          <button disabled>
            <FaUserEdit /> Edit Profile (Soon)
          </button>
          <button onClick={logout} style={{ color: 'var(--nav-danger-color)', marginTop: 'auto' }}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {/* Mobile Logout Button positioned top-right */}
      <button 
        onClick={logout} 
        className="logout-mobile-btn-absolute" 
        style={{ 
          display: 'none', 
          position: 'absolute', 
          top: '90px', 
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

      {/* --- THE FIX IS HERE --- */}
      {/* Both components are always rendered. CSS controls which one is visible. */}
      <section className="profile-content">
        <div className={`tab-pane ${activeTab === 'overview' ? 'active' : ''}`}>
          <ProfileOverview />
        </div>
        <div className={`tab-pane ${activeTab === 'history' ? 'active' : ''}`}>
          <ComplaintHistory />
        </div>
      </section>
    </div>
  );
};

export default Profile;