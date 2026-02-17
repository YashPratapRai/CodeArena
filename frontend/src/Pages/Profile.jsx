import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedProfile, setEditedProfile] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || '',
    github: user?.profile?.github || '',
    linkedin: user?.profile?.linkedin || '',
    twitter: user?.profile?.twitter || ''
  });

  if (!user) {
    return (
      <div className="auth-required-container">
        <div className="auth-required-card">
          <div className="auth-icon">
            <span>🔒</span>
          </div>
          <h2 className="auth-title">Authentication Required</h2>
          <p className="auth-subtitle">Please log in to view your profile</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="auth-login-btn"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const getRankColor = (rank) => {
    if (!rank || rank === 0) return 'rank-gray';
    if (rank <= 100) return 'rank-red';
    if (rank <= 1000) return 'rank-orange';
    if (rank <= 5000) return 'rank-yellow';
    return 'rank-green';
  };

  const getDifficultyPercentage = (solved, total) => {
    if (!total || total === 0) return 0;
    return Math.round((solved / total) * 100);
  };

  const handleSave = async () => {
    try {
      console.log('Saving profile:', editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      name: user.profile?.name || '',
      bio: user.profile?.bio || '',
      location: user.profile?.location || '',
      website: user.profile?.website || '',
      github: user.profile?.github || '',
      linkedin: user.profile?.linkedin || '',
      twitter: user.profile?.twitter || ''
    });
    setIsEditing(false);
  };

  const stats = user.stats || {
    totalSolved: 47,
    easySolved: 20,
    mediumSolved: 22,
    hardSolved: 5,
    rank: 1247,
    reputation: 1450,
    streak: 15,
    totalEasy: 500,
    totalMedium: 1000,
    totalHard: 500,
    totalFailed: 12
  };

  const acceptanceRate = stats.totalSolved > 0 
    ? Math.round((stats.totalSolved / (stats.totalSolved + stats.totalFailed)) * 100) 
    : 0;

  const totalProblems = stats.totalEasy + stats.totalMedium + stats.totalHard;
  const totalSolved = stats.easySolved + stats.mediumSolved + stats.hardSolved;
  const overallProgress = Math.round((totalSolved / totalProblems) * 100);

  const renderProgressBars = () => {
    return (
      <div className="progress-section">
        <div className="progress-header">
          <h4>Problem Solving Progress</h4>
          <span className="progress-percentage">{overallProgress}%</span>
        </div>
        
        <div className="progress-bar overall">
          <div 
            className="progress-fill overall-fill"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>

        <div className="difficulty-progress">
          <div className="progress-item">
            <div className="progress-info">
              <span className="difficulty-label easy">Easy</span>
              <span className="progress-numbers">
                {stats.easySolved}/{stats.totalEasy}
              </span>
            </div>
            <div className="progress-bar easy">
              <div 
                className="progress-fill easy-fill"
                style={{ width: `${getDifficultyPercentage(stats.easySolved, stats.totalEasy)}%` }}
              ></div>
            </div>
            <span className="progress-percentage">
              {getDifficultyPercentage(stats.easySolved, stats.totalEasy)}%
            </span>
          </div>

          <div className="progress-item">
            <div className="progress-info">
              <span className="difficulty-label medium">Medium</span>
              <span className="progress-numbers">
                {stats.mediumSolved}/{stats.totalMedium}
              </span>
            </div>
            <div className="progress-bar medium">
              <div 
                className="progress-fill medium-fill"
                style={{ width: `${getDifficultyPercentage(stats.mediumSolved, stats.totalMedium)}%` }}
              ></div>
            </div>
            <span className="progress-percentage">
              {getDifficultyPercentage(stats.mediumSolved, stats.totalMedium)}%
            </span>
          </div>

          <div className="progress-item">
            <div className="progress-info">
              <span className="difficulty-label hard">Hard</span>
              <span className="progress-numbers">
                {stats.hardSolved}/{stats.totalHard}
              </span>
            </div>
            <div className="progress-bar hard">
              <div 
                className="progress-fill hard-fill"
                style={{ width: `${getDifficultyPercentage(stats.hardSolved, stats.totalHard)}%` }}
              ></div>
            </div>
            <span className="progress-percentage">
              {getDifficultyPercentage(stats.hardSolved, stats.totalHard)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header Section */}
        <div className="profile-header">
          <div className="header-background"></div>
          <div className="header-content">
            <div className="profile-main-info">
              <div className="avatar-section">
                <div className="avatar-container">
                  <div className="avatar">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="profile-details">
                <div className="name-section">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                      className="name-input"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <>
                      <h1 className="profile-username-large">@{user.username}</h1>
                      {user.profile?.name && (
                        <p className="profile-display-name">{user.profile.name}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Stats Overview */}
                <div className="quick-stats">
                  <div className="quick-stat-item">
                    <span className="quick-stat-value">{stats.totalSolved}</span>
                    <span className="quick-stat-label">Solved</span>
                  </div>
                  <div className="quick-stat-divider"></div>
                  <div className="quick-stat-item">
                    <span className="quick-stat-value">{stats.rank}</span>
                    <span className="quick-stat-label">Rank</span>
                  </div>
                  <div className="quick-stat-divider"></div>
                  <div className="quick-stat-item">
                    <span className="quick-stat-value">{acceptanceRate}%</span>
                    <span className="quick-stat-label">Acceptance</span>
                  </div>
                  <div className="quick-stat-divider"></div>
                  <div className="quick-stat-item">
                    <span className="quick-stat-value streak">{stats.streak}</span>
                    <span className="quick-stat-label">Streak</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <div className="edit-actions">
                    <button onClick={handleSave} className="save-btn">
                      Save Changes
                    </button>
                    <button onClick={handleCancel} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="bio-section">
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  className="bio-input"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  maxLength={160}
                />
              ) : (
                user.profile?.bio ? (
                  <p className="bio-text">{user.profile.bio}</p>
                ) : (
                  <p className="bio-placeholder">No bio yet. Tell us about yourself!</p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-nav">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`nav-tab ${activeTab === 'solutions' ? 'active' : ''}`}
              onClick={() => setActiveTab('solutions')}
            >
              Solutions
            </button>
            <button 
              className={`nav-tab ${activeTab === 'discussions' ? 'active' : ''}`}
              onClick={() => setActiveTab('discussions')}
            >
              Discussions
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Left Column - Problem Solving Stats */}
          <div className="content-left">
            {/* Problem Solving Progress */}
            {renderProgressBars()}

            {/* Detailed Stats Cards */}
            <div className="detailed-stats">
              <h3 className="section-title">Detailed Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalSolved}</div>
                    <div className="stat-label">Total Solved</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🟢</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.easySolved}</div>
                    <div className="stat-label">Easy</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🟡</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.mediumSolved}</div>
                    <div className="stat-label">Medium</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔴</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.hardSolved}</div>
                    <div className="stat-label">Hard</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank & Achievements */}
            <div className="achievements-section">
              <h3 className="section-title">Rank & Achievements</h3>
              <div className="achievements-grid">
                <div className="achievement-card">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-content">
                    <div className="achievement-title">Global Rank</div>
                    <div className={`achievement-value ${getRankColor(stats.rank)}`}>
                      #{stats.rank}
                    </div>
                  </div>
                </div>

                <div className="achievement-card">
                  <div className="achievement-icon">⭐</div>
                  <div className="achievement-content">
                    <div className="achievement-title">Reputation</div>
                    <div className="achievement-value">{stats.reputation}</div>
                  </div>
                </div>

                <div className="achievement-card">
                  <div className="achievement-icon">🔥</div>
                  <div className="achievement-content">
                    <div className="achievement-title">Current Streak</div>
                    <div className="achievement-value">{stats.streak} days</div>
                  </div>
                </div>

                <div className="achievement-card">
                  <div className="achievement-icon">🎯</div>
                  <div className="achievement-content">
                    <div className="achievement-title">Acceptance Rate</div>
                    <div className="achievement-value">{acceptanceRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Personal Information */}
          <div className="content-right">
            {/* Personal Information */}
            <div className="personal-info-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
                
                {user.profile?.location && (
                  <div className="info-row">
                    <span className="info-label">Location</span>
                    <span className="info-value">{user.profile.location}</span>
                  </div>
                )}

                {user.profile?.website && (
                  <div className="info-row">
                    <span className="info-label">Website</span>
                    <a href={user.profile.website} className="info-link" target="_blank" rel="noopener noreferrer">
                      {user.profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {user.profile?.github && (
                  <div className="info-row">
                    <span className="info-label">GitHub</span>
                    <a href={user.profile.github} className="info-link" target="_blank" rel="noopener noreferrer">
                      {user.profile.github.replace('https://github.com/', '')}
                    </a>
                  </div>
                )}

                {user.profile?.linkedin && (
                  <div className="info-row">
                    <span className="info-label">LinkedIn</span>
                    <a href={user.profile.linkedin} className="info-link" target="_blank" rel="noopener noreferrer">
                      {user.profile.linkedin.replace('https://linkedin.com/in/', '')}
                    </a>
                  </div>
                )}

                {user.profile?.twitter && (
                  <div className="info-row">
                    <span className="info-label">Twitter</span>
                    <a href={user.profile.twitter} className="info-link" target="_blank" rel="noopener noreferrer">
                      @{user.profile.twitter.replace('https://twitter.com/', '')}
                    </a>
                  </div>
                )}

                {user.joinedDate && (
                  <div className="info-row">
                    <span className="info-label">Joined</span>
                    <span className="info-value">
                      {new Date(user.joinedDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;