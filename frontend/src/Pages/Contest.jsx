import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contest.css';

const Contest = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedContest, setSelectedContest] = useState(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockContests = [
      {
        id: 1,
        title: "Weekly Contest 385",
        description: "Join our weekly coding challenge featuring 4 problems of varying difficulty",
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 90,
        problems: 4,
        participants: 1250,
        difficulty: "Medium",
        status: "upcoming",
        type: "weekly",
        registered: true
      },
      {
        id: 2,
        title: "Weekly Contest 384",
        description: "Previous week's contest problems available for practice",
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        duration: 90,
        problems: 4,
        participants: 2341,
        difficulty: "Medium",
        status: "completed",
        type: "weekly",
        registered: false
      },
      {
        id: 3,
        title: "Biweekly Contest 125",
        description: "Special biweekly contest with extended duration",
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 120,
        problems: 4,
        participants: 0,
        difficulty: "Hard",
        status: "upcoming",
        type: "biweekly",
        registered: false
      },
      {
        id: 4,
        title: "Weekly Contest 383",
        description: "Archived contest for practice",
        startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        duration: 90,
        problems: 4,
        participants: 1890,
        difficulty: "Easy",
        status: "completed",
        type: "weekly",
        registered: false
      }
    ];
    
    setContests(mockContests);
    setLoading(false);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (startTime) => {
    const now = new Date();
    const diff = startTime - now;
    
    if (diff <= 0) return "Started";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  const getStatusBadge = (contest) => {
    switch (contest.status) {
      case 'upcoming':
        return <span className="status-badge upcoming">Upcoming</span>;
      case 'ongoing':
        return <span className="status-badge ongoing">Live</span>;
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

  const handleRegister = (contestId) => {
    setContests(prev => prev.map(contest => 
      contest.id === contestId ? { ...contest, registered: true } : contest
    ));
  };

  const handleViewDetails = (contest) => {
    setSelectedContest(contest);
  };

  const filteredContests = contests.filter(contest => {
    if (activeTab === 'upcoming') return contest.status === 'upcoming';
    if (activeTab === 'ongoing') return contest.status === 'ongoing';
    if (activeTab === 'completed') return contest.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="contest-container">
        <div className="contest-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Contests...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="contest-container">
      {/* Header Section */}
      <div className="contest-header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="header-main">
            <div className="header-left">
              <h1 className="header-title">Coding Contests</h1>
              <p className="header-subtitle">
                Test your skills in weekly programming challenges
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <div className="stat-number">{contests.filter(c => c.status === 'upcoming').length}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{contests.filter(c => c.status === 'completed').length}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="contest-content">
        {/* Navigation Tabs */}
        <div className="contest-nav">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Contests
            </button>
            <button 
              className={`nav-tab ${activeTab === 'ongoing' ? 'active' : ''}`}
              onClick={() => setActiveTab('ongoing')}
            >
              Live Contests
            </button>
            <button 
              className={`nav-tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Past Contests
            </button>
          </div>
        </div>

        {/* Contest Cards */}
        <div className="contest-grid">
          {filteredContests.map(contest => (
            <div key={contest.id} className="contest-card">
              <div className="contest-card-header">
                <div className="contest-title-section">
                  <h3 className="contest-title">{contest.title}</h3>
                  {getStatusBadge(contest)}
                </div>
                <div className="contest-type">{contest.type}</div>
              </div>

              <p className="contest-description">{contest.description}</p>

              <div className="contest-details">
                <div className="detail-item">
                  <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{contest.duration} minutes</span>
                </div>
                <div className="detail-item">
                  <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{contest.problems} problems</span>
                </div>
                <div className="detail-item">
                  <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{contest.participants.toLocaleString()} participants</span>
                </div>
              </div>

              <div className="contest-time">
                <svg className="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatTime(contest.startTime)}</span>
                <span className="time-until">{getTimeUntil(contest.startTime)}</span>
              </div>

              <div className="contest-actions">
                {contest.status === 'upcoming' && (
                  <>
                    {contest.registered ? (
                      <button className="btn registered">
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Registered
                      </button>
                    ) : (
                      <button 
                        className="btn register"
                        onClick={() => handleRegister(contest.id)}
                      >
                        Register Now
                      </button>
                    )}
                    <button 
                      className="btn outline"
                      onClick={() => handleViewDetails(contest)}
                    >
                      View Details
                    </button>
                  </>
                )}
                {contest.status === 'ongoing' && (
                  <button className="btn primary">
                    Enter Contest
                  </button>
                )}
                {contest.status === 'completed' && (
                  <button className="btn outline">
                    View Solutions
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredContests.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>No contests found</h3>
            <p>There are no {activeTab} contests at the moment.</p>
          </div>
        )}
      </div>

      {/* Contest Detail Modal */}
      {selectedContest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedContest.title}</h2>
              <button 
                className="close-modal"
                onClick={() => setSelectedContest(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{selectedContest.description}</p>
              
              <div className="contest-info-grid">
                <div className="info-item">
                  <label>Start Time</label>
                  <span>{formatTime(selectedContest.startTime)}</span>
                </div>
                <div className="info-item">
                  <label>Duration</label>
                  <span>{selectedContest.duration} minutes</span>
                </div>
                <div className="info-item">
                  <label>Problems</label>
                  <span>{selectedContest.problems}</span>
                </div>
                <div className="info-item">
                  <label>Difficulty</label>
                  <span>{selectedContest.difficulty}</span>
                </div>
                <div className="info-item">
                  <label>Type</label>
                  <span>{selectedContest.type}</span>
                </div>
              </div>

              <div className="contest-rules">
                <h4>Contest Rules</h4>
                <ul>
                  <li>All problems must be solved within the time limit</li>
                  <li>Points are awarded based on submission time and correctness</li>
                  <li>Plagiarism will result in disqualification</li>
                  <li>Discussion during the contest is prohibited</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              {selectedContest.registered ? (
                <button className="btn registered" disabled>
                  Already Registered
                </button>
              ) : (
                <button 
                  className="btn primary"
                  onClick={() => {
                    handleRegister(selectedContest.id);
                    setSelectedContest(null);
                  }}
                >
                  Register for Contest
                </button>
              )}
              <button 
                className="btn outline"
                onClick={() => setSelectedContest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contest;