import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'user', // Default to user
    adminSecret: '' // For admin registration
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.username.trim()) return 'Username is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Please enter a valid email';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (formData.role === 'admin' && !formData.adminSecret) return 'Admin secret key is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        adminSecret: formData.adminSecret
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <Link to="/" className="register-logo">
            <span className="logo-icon">⚡</span>
            <h1>CodeArena</h1>
          </Link>
          <h2>Create your account</h2>
          <p>Join CodeArena and start coding</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${formData.role === 'user' ? 'active' : ''}`}
            onClick={() => setFormData({...formData, role: 'user', adminSecret: ''})}
          >
            <span className="role-icon">👤</span>
            <span className="role-text">Sign up as User</span>
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
            onClick={() => setFormData({...formData, role: 'admin'})}
          >
            <span className="role-icon">👑</span>
            <span className="role-text">Sign up as Admin</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                tabIndex="-1"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                tabIndex="-1"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Admin Secret Field - Only shown when admin role is selected */}
          {formData.role === 'admin' && (
            <div className="form-group admin-secret">
              <label htmlFor="adminSecret">
                <span className="admin-icon">🔑</span> Admin Secret Key
              </label>
              <div className="password-input">
                <input
                  type={showAdminSecret ? 'text' : 'password'}
                  id="adminSecret"
                  name="adminSecret"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  placeholder="Enter admin secret key"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminSecret(!showAdminSecret)}
                  className="password-toggle"
                  tabIndex="-1"
                >
                  {showAdminSecret ? 'Hide' : 'Show'}
                </button>
              </div>
              <small className="secret-hint">Contact system administrator for the secret key</small>
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating account...' : `Sign up as ${formData.role}`}
          </button>
        </form>

        {/* Login Link */}
        <p className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        {/* Terms */}
        <p className="terms">
          By signing up, you agree to our{' '}
          <a href="/terms">Terms of Service</a> and{' '}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Register;