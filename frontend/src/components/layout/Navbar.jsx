import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Brand/Logo */}
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo">
              <span className="navbar-logo-icon">⚡</span>
            </div>
            <span className="navbar-title">CodeArena</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav">
            {/* Problems Dropdown */}
            <div 
              className={`nav-item dropdown ${activeDropdown === 'problems' ? 'active' : ''}`}
              onMouseEnter={() => setActiveDropdown('problems')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className={`navbar-link ${isActive('/problems') ? 'active' : ''}`}
                onClick={() => toggleDropdown('problems')}
              >
                <span className="nav-icon">💻</span>
                Problems
                <span className="dropdown-arrow">▼</span>
              </button>
              <div className="dropdown-menu">
                <Link to="/problems" className="dropdown-item">
                  <span className="dropdown-icon">📚</span>
                  <div>
                    <div className="dropdown-title">All Problems</div>
                    <div className="dropdown-desc">2500+ coding challenges</div>
                  </div>
                </Link>
                <Link to="/problems?difficulty=easy" className="dropdown-item">
                  <span className="dropdown-icon">🟢</span>
                  <div>
                    <div className="dropdown-title">Easy</div>
                    <div className="dropdown-desc">Beginner friendly</div>
                  </div>
                </Link>
                <Link to="/problems?difficulty=medium" className="dropdown-item">
                  <span className="dropdown-icon">🟡</span>
                  <div>
                    <div className="dropdown-title">Medium</div>
                    <div className="dropdown-desc">Interview focused</div>
                  </div>
                </Link>
                <Link to="/problems?difficulty=hard" className="dropdown-item">
                  <span className="dropdown-icon">🔴</span>
                  <div>
                    <div className="dropdown-title">Hard</div>
                    <div className="dropdown-desc">Expert level</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Contest Link */}
            <Link 
              to="/contest" 
              className={`navbar-link ${isActive('/contest') ? 'active' : ''}`}
            >
              <span className="nav-icon">🏆</span>
              Contest
            </Link>

            {/* Leaderboard Link */}
            <Link 
              to="/leaderboard" 
              className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              Leaderboard
            </Link>

            {/* Discuss Link */}
            <Link 
              to="/discuss" 
              className={`navbar-link ${isActive('/discuss') ? 'active' : ''}`}
            >
              <span className="nav-icon">💬</span>
              Discuss
            </Link>

            {/* Admin link (visible only for admin users) */}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`navbar-link admin-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <span className="nav-icon">🔧</span>
                Admin
              </Link>
            )}
          </div>

          {/* Desktop User Section */}
          <div className="navbar-user">
            {user ? (
              <div className="user-section">
                <div 
                  className={`nav-item dropdown ${activeDropdown === 'profile' ? 'active' : ''}`}
                  onMouseEnter={() => setActiveDropdown('profile')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="user-profile">
                    <div className="user-avatar">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{user.username}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  <div className="dropdown-menu profile-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      <div>
                        <div className="dropdown-title">My Profile</div>
                        <div className="dropdown-desc">View your progress</div>
                      </div>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-item"
                    >
                      <span className="dropdown-icon">🚪</span>
                      <div>
                        <div className="dropdown-title">Sign Out</div>
                        <div className="dropdown-desc">Logout from account</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className="auth-btn login-btn"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="auth-btn signup-btn"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-button ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="mobile-menu-line"></span>
            <span className="mobile-menu-line"></span>
            <span className="mobile-menu-line"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav">
            <div className="mobile-nav-section">
              <div className="mobile-nav-title">Problems</div>
              <Link to="/problems" className="mobile-link">
                <span className="nav-icon">📚</span>
                All Problems
              </Link>
              <Link to="/problems?difficulty=easy" className="mobile-link">
                <span className="nav-icon">🟢</span>
                Easy
              </Link>
              <Link to="/problems?difficulty=medium" className="mobile-link">
                <span className="nav-icon">🟡</span>
                Medium
              </Link>
              <Link to="/problems?difficulty=hard" className="mobile-link">
                <span className="nav-icon">🔴</span>
                Hard
              </Link>
            </div>

            <div className="mobile-nav-section">
              <Link to="/contest" className="mobile-link">
                <span className="nav-icon">🏆</span>
                Contest
              </Link>
              <Link to="/leaderboard" className="mobile-link">
                <span className="nav-icon">📊</span>
                Leaderboard
              </Link>
              <Link to="/discuss" className="mobile-link">
                <span className="nav-icon">💬</span>
                Discuss
              </Link>
            </div>

            {/* Admin Panel (mobile) */}
            {user?.role === 'admin' && (
              <div className="mobile-nav-section">
                <Link to="/admin" className="mobile-link admin-link">
                  <span className="nav-icon">🔧</span>
                  Admin Panel
                </Link>
              </div>
            )}
          </div>

          <div className="mobile-user-section">
            {user ? (
              <>
                <div className="mobile-user-info">
                  <div className="user-avatar large">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.username}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                </div>
                <Link to="/profile" className="mobile-link profile-link">
                  <span className="nav-icon">👤</span>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="mobile-logout-btn"
                >
                  <span className="nav-icon">🚪</span>
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="auth-btn login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="auth-btn signup-btn">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;