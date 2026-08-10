import React from 'react';
import useScrollToTop from '../../hooks/useScrollToTop';
import { Link } from 'react-router-dom';
import { FaBroadcastTower, FaRoute, FaUsers, FaArrowRight } from 'react-icons/fa';
import heroImage from '../../assets/hero.png';
import './Home.css';

import { useAuth } from '../../hooks/useAuth';

const Home = () => {
  useScrollToTop();
  const { user } = useAuth();
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <header 
        className="hero-section" 
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">A Smarter Way to a Cleaner Pune</h1>
          <p className="hero-subtitle">
            Leveraging smart technology and real-time data to create efficient, clean, and sustainable communities right here in Pune.
          </p>
          <div className="hero-buttons">
            {user ? (
              <Link to={`/${user.role.toLowerCase()}/dashboard`} className="btn btn-primary btn-large">
                Go to Portal <FaArrowRight className="arrow-icon" />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-large">
                Login / Register to Access Portal <FaArrowRight className="arrow-icon" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Collect Data</h3>
              <p>Smart bins with sensors measure fill levels and transmit real-time data to our cloud platform.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Monitor & Analyze</h3>
              <p>Our dashboard displays bin status on a live map, using AI to predict fill times and identify issues.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Act Intelligently</h3>
              <p>AI optimizes collection routes for workers, while citizens can easily report issues and earn rewards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaBroadcastTower className="feature-icon" />
              <h3>Real-Time Monitoring</h3>
              <p>View every bin's status and location on an interactive map. Say goodbye to overflowing trash.</p>
            </div>
            <div className="feature-card">
              <FaRoute className="feature-icon" />
              <h3>AI-Powered Routes</h3>
              <p>Our system calculates the most fuel and time-efficient routes for waste collection trucks.</p>
            </div>
            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Citizen Engagement</h3>
              <p>An easy-to-use portal for citizens to report issues and stay informed about cleanliness in their area.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container cta-content">
          {/* EDITED: More direct, Pune-focused headline */}
          <h2>Join Us in Making Pune Cleaner</h2>
          <p>Become a part of the solution. Report issues, track progress, and help make Pune a leader in smart sanitation.</p>
          <Link to="/citizen/report" className="btn btn-light">Report an Issue</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

