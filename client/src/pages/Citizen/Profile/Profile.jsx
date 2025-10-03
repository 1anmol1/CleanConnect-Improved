import React, { useState } from 'react';
import { FaTrophy, FaHistory, FaUserEdit } from 'react-icons/fa';
import ComplaintHistory from '../../../components/Profile/ComplaintHistory';
import ProfileOverview from '../../../components/Profile/ProfileOverview';
import './Profile.css';

const Profile = () => {
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
        </nav>
      </aside>

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