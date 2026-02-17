import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminPanel from '../components/admin/AdminPanel';
import '../styles/AdminPanel.css';

const AdminPanelPage = () => {
  const { user } = useAuth();

  // Redirect non-admin users with enhanced UI
  if (!user || user.role !== 'admin') {
    return (
      <div className="access-denied-container">
        {/* Animated Background */}
        <div className="access-denied-background">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
          <div className="bg-shape shape-4"></div>
        </div>

        <div className="access-denied-content">
          {/* Header */}
          <div className="access-denied-header">
            <div className="logo-section">
              <Link to="/" className="logo-link">
                <div className="logo-icon">
                  <span>⚡</span>
                </div>
                <span className="logo-text">CodeArena</span>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="access-denied-card">
            <div className="icon-container">
              <div className="icon-wrapper">
                <svg className="shield-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
                <div className="icon-glow"></div>
              </div>
            </div>

            <div className="text-content">
              <h1 className="title">Administrator Access Required</h1>
              <p className="subtitle">
                This area is restricted to authorized administrators only. 
                You need elevated privileges to access the admin panel.
              </p>
              
              <div className="user-info">
                <div className="user-avatar">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.username || 'Guest User'}</span>
                  <span className="user-role">{user?.role || 'user'}</span>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon security">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
                <h3>Security Protected</h3>
                <p>Advanced security measures protect administrative functions</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon analytics">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </div>
                <h3>Platform Analytics</h3>
                <p>Monitor user activity and platform performance</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon management">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <h3>Content Management</h3>
                <p>Manage problems, users, and platform content</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={() => window.history.back()}
                className="action-btn secondary-btn"
              >
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Go Back
              </button>
              
              <Link to="/problems" className="action-btn primary-btn">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Browse Problems
              </Link>

              {!user && (
                <Link to="/login" className="action-btn accent-btn">
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Sign In
                </Link>
              )}
            </div>

            {/* Contact Admin Section */}
            <div className="contact-section">
              <div className="contact-info">
                <svg className="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <div>
                  <p className="contact-title">Need Admin Access?</p>
                  <p className="contact-subtitle">Contact your system administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="access-denied-footer">
            <p className="footer-text">
              CodeArena Platform • Secure Admin Access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
};

export default AdminPanelPage;