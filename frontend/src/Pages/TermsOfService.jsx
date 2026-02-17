import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      {/* Header */}
      <div className="legal-header">
        <Link to="/" className="legal-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">CodeArena</span>
        </Link>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-subtitle">Last updated: February 2026</p>
      </div>

      <div className="legal-container">
        <div className="legal-content">
          <div className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using CodeArena ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </div>

          <div className="legal-section">
            <h2>2. User Accounts</h2>
            <p>To use certain features of the Platform, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            <ul>
              <li>You must be at least 13 years old to use the Platform</li>
              <li>You provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Share malicious code or attempt to hack the Platform</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post inappropriate or offensive content</li>
              <li>Attempt to gain unauthorized access to other accounts</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. Code Submissions</h2>
            <p>When you submit code solutions to problems on CodeArena:</p>
            <ul>
              <li>You retain ownership of your code</li>
              <li>You grant us permission to display your solutions publicly</li>
              <li>You agree that other users can view and learn from your solutions</li>
              <li>Do not submit code that you don't have rights to share</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. Intellectual Property</h2>
            <p>The Platform, including all content, features, and functionality, is owned by CodeArena and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Platform.</p>
          </div>

          <div className="legal-section">
            <h2>6. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our discretion, particularly if you violate these terms. You may also delete your account at any time through your profile settings.</p>
          </div>

          <div className="legal-section">
            <h2>7. Disclaimer of Warranties</h2>
            <p>The Platform is provided "as is" without warranties of any kind. We do not guarantee that the Platform will be error-free or uninterrupted.</p>
          </div>

          <div className="legal-section">
            <h2>8. Limitation of Liability</h2>
            <p>CodeArena shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</p>
          </div>

          <div className="legal-section">
            <h2>9. Changes to Terms</h2>
            <p>We may update these terms from time to time. We will notify users of significant changes via email or platform notifications.</p>
          </div>

          <div className="legal-section">
            <h2>10. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us at:</p>
            <p className="contact-email">📧 librarytracker3@gmail.com</p>
          </div>
        </div>

        <div className="legal-footer">
          <p>By using CodeArena, you acknowledge that you have read and understood these Terms of Service.</p>
          <div className="legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/about">About Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;