import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    try {
      const formPayload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        _template: 'table',
        _captcha: 'false',
        _subject: `New Contact Form Message from ${formData.name}`,
        _honey: '',
        _next: window.location.href
      };

      const response = await fetch('https://formsubmit.co/ajax/librarytracker3@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formPayload)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setStatus({ loading: false, error: null, success: true });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      setStatus({ 
        loading: false, 
        error: 'Failed to send. Email us directly at librarytracker3@gmail.com', 
        success: false 
      });
    }
  };

  // Calculate form progress
  const filledFields = Object.values(formData).filter(v => v.trim() !== '').length;
  const totalFields = Object.keys(formData).length;
  const formProgress = (filledFields / totalFields) * 100;

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <Link to="/" className="contact-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">CodeArena</span>
        </Link>
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-subtitle">We'd love to hear from you</p>
      </div>

      <div className="contact-container">
        {/* Left Column - Contact Info */}
        <div className="contact-info">
          <h2>Let's Connect</h2>
          <p className="info-text">
            Have questions? Want to report an issue? Just want to say hello? We're here for you!
          </p>

          <div className="info-items">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <h3>Email Us</h3>
                <p>librarytracker3@gmail.com</p>
                <span className="info-badge">Replies in 24h</span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">🕒</span>
              <div>
                <h3>Response Time</h3>
                <p>Within 24-48 hours</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <h3>Location</h3>
                <p>Remote Team Worldwide</p>
              </div>
            </div>
          </div>

          {/* <div className="social-links">
            <a href="#" className="social-link">📘</a>
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">📷</a>
            <a href="#" className="social-link">💬</a>
          </div> */}
        </div>

        {/* Right Column - Form */}
        <div className="contact-form-container">
          {status.success ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Thank You, {formData.name}!</h2>
              <p>We'll get back to you soon at <strong>{formData.email}</strong></p>
              <button 
                className="send-another-btn"
                onClick={() => setStatus({ loading: false, error: null, success: false })}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-header">
                <h2>Send a Message</h2>
                <div className="progress-text">{Math.round(formProgress)}% complete</div>
              </div>
              
              {status.error && <div className="error-message">{status.error}</div>}

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${formProgress}%` }}></div>
              </div>

              <div className="form-group">
                <label>👤 Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={status.loading}
                />
              </div>

              <div className="form-group">
                <label>📧 Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  disabled={status.loading}
                />
              </div>

              <div className="form-group">
                <label>📝 Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                  disabled={status.loading}
                />
              </div>

              <div className="form-group">
                <label>💬 Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind..."
                  rows="4"
                  required
                  disabled={status.loading}
                ></textarea>
                <small>{formData.message.length}/500</small>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={status.loading || formProgress < 100}
              >
                {status.loading ? 'Sending...' : '✈️ Send Message'}
              </button>

              <p className="form-note">
                🔒 Your information is safe with us
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="contact-footer">
        <p>© 2026 CodeArena | <Link to="/about">About</Link> | <Link to="/careers">Careers</Link></p>
      </div>
    </div>
  );
};

export default ContactUs;