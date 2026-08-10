import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <h1>Terms and Conditions</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      
      <section style={{ marginTop: '20px' }}>
        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using the CleanConnect platform, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>2. User Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate information when reporting issues.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>3. Acceptable Use</h2>
        <p>You agree not to use the platform for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service. False reporting or misuse of the system may result in account suspension.</p>
      </section>
      
      <section style={{ marginTop: '20px' }}>
        <h2>4. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. We will notify users of any significant changes. Continued use of the platform constitutes acceptance of the modified terms.</p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
