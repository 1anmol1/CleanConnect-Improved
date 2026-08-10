import React from 'react';
import useScrollToTop from '../../hooks/useScrollToTop';

const PrivacyPolicy = () => {
  useScrollToTop();
  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      
      <section style={{ marginTop: '20px' }}>
        <h2>1. Introduction</h2>
        <p>Welcome to CleanConnect. We are committed to protecting your personal information and your right to privacy.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>2. Information We Collect</h2>
        <p>We collect personal information that you voluntarily provide to us when you register on the App, including location data to facilitate issue mapping and routing.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>3. How We Use Your Information</h2>
        <p>We use personal information collected via our App to facilitate account creation, process issue reports, manage user accounts, and improve city maintenance.</p>
      </section>
      
      <section style={{ marginTop: '20px' }}>
        <h2>4. Location Information</h2>
        <p>We may request access to and track location-based information from your mobile device to provide location-based services (like mapping reports). You can change this in your device settings.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
