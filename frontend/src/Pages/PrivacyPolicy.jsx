import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      {/* Header */}
      <div className="legal-header">
        <Link to="/" className="legal-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">CodeArena</span>
        </Link>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-subtitle">Last updated: February 2026</p>
      </div>

      <div className="legal-container">
        <div className="legal-content">
          <div className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>We collect information to provide better services to our users:</p>
            <h3>Account Information:</h3>
            <ul>
              <li>Name and email address</li>
              <li>Username and password</li>
              <li>Profile information (bio, location, social links)</li>
            </ul>
            <h3>Usage Information:</h3>
            <ul>
              <li>Problems solved and code submissions</li>
              <li>Progress tracking data</li>
              <li>Platform activity and interactions</li>
            </ul>
            <h3>Technical Information:</h3>
            <ul>
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Cookies and usage data</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Track your progress and performance</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about updates and features</li>
              <li>Prevent fraud and ensure security</li>
              <li>Analyze usage patterns to improve the Platform</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share information:</p>
            <ul>
              <li>With your consent</li>
              <li>For legal reasons (court orders, legal processes)</li>
              <li>To protect rights and safety</li>
              <li>With service providers who assist in operating the Platform</li>
            </ul>
            <p className="note">Your code solutions may be publicly visible to other users as part of the learning community.</p>
          </div>

          <div className="legal-section">
            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your information:</p>
            <ul>
              <li>Encryption of sensitive data</li>
              <li>Regular security audits</li>
              <li>Secure server infrastructure</li>
              <li>Access controls and authentication</li>
            </ul>
            <p>However, no method of transmission over the Internet is 100% secure.</p>
          </div>

          <div className="legal-section">
            <h2>5. Cookies</h2>
            <p>We use cookies to:</p>
            <ul>
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze site traffic</li>
              <li>Improve user experience</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>
          </div>

          <div className="legal-section">
            <h2>6. Third-Party Services</h2>
            <p>We may use third-party services for:</p>
            <ul>
              <li>Analytics (to understand usage patterns)</li>
              <li>Email communications</li>
              <li>Payment processing (if applicable)</li>
            </ul>
            <p>These services have their own privacy policies.</p>
          </div>

          <div className="legal-section">
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of communications</li>
            </ul>
            <p>To exercise these rights, contact us at librarytracker3@gmail.com</p>
          </div>

          <div className="legal-section">
            <h2>8. Data Retention</h2>
            <p>We retain your information as long as your account is active. If you delete your account, we will remove your personal information within 30 days, though some anonymized data may be retained for analytical purposes.</p>
          </div>

          <div className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>CodeArena is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe a child has provided us with personal information, please contact us.</p>
          </div>

          <div className="legal-section">
            <h2>10. Changes to Privacy Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify users of significant changes via email or platform notifications.</p>
          </div>

          <div className="legal-section">
            <h2>11. Contact Us</h2>
            <p>For privacy-related questions or concerns:</p>
            <div className="contact-details">
              <p>📧 librarytracker3@gmail.com</p>
              <p>🕒 Response time: Within 48 hours</p>
            </div>
          </div>
        </div>

        <div className="legal-footer">
          <p>Your privacy is important to us. We're committed to protecting your personal information.</p>
          <div className="legal-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/about">About Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;