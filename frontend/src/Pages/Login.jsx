import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' // Default to user
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    
    const demoAccounts = {
      admin: { email: 'admin@codearena.com', password: 'admin123', role: 'admin' },
      user: { email: 'user@codearena.com', password: 'user123', role: 'user' }
    };

    try {
      await login(demoAccounts[role]);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <Link to="/" className="login-logo">
            <span className="logo-icon">⚡</span>
            <h1>CodeArena</h1>
          </Link>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your coding journey</p>
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
            onClick={() => setFormData({...formData, role: 'user'})}
          >
            <span className="role-icon">👤</span>
            <span className="role-text">User</span>
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
            onClick={() => setFormData({...formData, role: 'admin'})}
          >
            <span className="role-icon">👑</span>
            <span className="role-text">Admin</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={`Enter ${formData.role} email`}
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
                placeholder="Enter your password"
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

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                name="remember"
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : `Sign in as ${formData.role}`}
          </button>
        </form>

        {/* Demo Login Buttons */}
        <div className="demo-login">
          <p className="demo-title">Quick Demo Access:</p>
          <div className="demo-buttons">
            <button
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
              className="demo-btn user"
            >
              <span className="demo-icon">👤</span>
              Demo User
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="demo-btn admin"
            >
              <span className="demo-icon">👑</span>
              Demo Admin
            </button>
          </div>
        </div>

        {/* Register Link */}
        <p className="register-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>

        {/* Terms */}
        <p className="terms">
          By signing in, you agree to our{' '}
          <a href="/terms">Terms of Service</a> and{' '}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;