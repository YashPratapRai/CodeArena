import React, { useState, useEffect } from 'react';
import userService from '../services/users';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, sortBy, sortOrder, difficultyFilter]);

  const fetchLeaderboard = async () => {
    try {
      const response = await userService.getLeaderboard();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDifficulty = difficultyFilter === 'all' || 
        (user.stats?.[`${difficultyFilter}Solved`] || 0) > 0;
      
      return matchesSearch && matchesDifficulty;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'totalSolved':
          aValue = a.stats?.totalSolved || 0;
          bValue = b.stats?.totalSolved || 0;
          break;
        case 'easySolved':
          aValue = a.stats?.easySolved || 0;
          bValue = b.stats?.easySolved || 0;
          break;
        case 'mediumSolved':
          aValue = a.stats?.mediumSolved || 0;
          bValue = b.stats?.mediumSolved || 0;
          break;
        case 'hardSolved':
          aValue = a.stats?.hardSolved || 0;
          bValue = b.stats?.hardSolved || 0;
          break;
        case 'reputation':
          aValue = a.stats?.reputation || 0;
          bValue = b.stats?.reputation || 0;
          break;
        case 'username':
          aValue = a.username?.toLowerCase();
          bValue = b.username?.toLowerCase();
          break;
        case 'rank':
        default:
          aValue = a.stats?.rank || users.indexOf(a);
          bValue = b.stats?.rank || users.indexOf(b);
          break;
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return { emoji: '🥇', class: 'rank-gold' };
    if (rank === 1) return { emoji: '🥈', class: 'rank-silver' };
    if (rank === 2) return { emoji: '🥉', class: 'rank-bronze' };
    return { emoji: `#${rank + 1}`, class: 'rank-normal' };
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="sort-icon">↕️</span>;
    return sortOrder === 'asc' ? 
      <span className="sort-icon">↑</span> : 
      <span className="sort-icon">↓</span>;
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="header-title">🏆 Leaderboard</h1>
          </div>
          <p className="header-subtitle">Top performers in the coding community</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="leaderboard-content">
        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-container">
            <div className="search-box">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          <div className="filter-controls">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy Solvers</option>
              <option value="medium">Medium Solvers</option>
              <option value="hard">Hard Solvers</option>
            </select>
            
            <div className="users-count">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th 
                  className="rank-header sortable"
                  onClick={() => handleSort('rank')}
                >
                  <div className="header-content">
                    Rank
                    <SortIcon column="rank" />
                  </div>
                </th>
                <th className="user-header">User</th>
                <th 
                  className="score-header sortable"
                  onClick={() => handleSort('totalSolved')}
                >
                  <div className="header-content">
                    Solved
                    <SortIcon column="totalSolved" />
                  </div>
                </th>
                <th 
                  className="difficulty-header sortable easy"
                  onClick={() => handleSort('easySolved')}
                >
                  <div className="header-content">
                    Easy
                    <SortIcon column="easySolved" />
                  </div>
                </th>
                <th 
                  className="difficulty-header sortable medium"
                  onClick={() => handleSort('mediumSolved')}
                >
                  <div className="header-content">
                    Medium
                    <SortIcon column="mediumSolved" />
                  </div>
                </th>
                <th 
                  className="difficulty-header sortable hard"
                  onClick={() => handleSort('hardSolved')}
                >
                  <div className="header-content">
                    Hard
                    <SortIcon column="hardSolved" />
                  </div>
                </th>
                <th 
                  className="score-header sortable"
                  onClick={() => handleSort('reputation')}
                >
                  <div className="header-content">
                    Reputation
                    <SortIcon column="reputation" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const rankBadge = getRankBadge(index);
                return (
                  <tr key={user._id} className="leaderboard-row">
                    <td className="rank-cell">
                      <div className={`rank-badge ${rankBadge.class}`}>
                        {rankBadge.emoji}
                      </div>
                    </td>
                    <td className="user-cell">
                      <div className="user-info">
                        <div className="avatar">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="username">
                            {user.profile?.name || user.username}
                          </div>
                          <div className="user-handle">
                            @{user.username}
                            {user.stats?.streak > 0 && (
                              <span className="streak-badge">
                                🔥 {user.stats.streak}d
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="score-cell">
                      <div className="total-solved">
                        {user.stats?.totalSolved || 0}
                      </div>
                    </td>
                    <td className="difficulty-cell easy">
                      <div className="difficulty-score">
                        <span className="count">{user.stats?.easySolved || 0}</span>
                        {user.stats?.totalEasy && user.stats.totalEasy > 0 && (
                          <span className="percentage">
                            {Math.round((user.stats.easySolved / user.stats.totalEasy) * 100)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="difficulty-cell medium">
                      <div className="difficulty-score">
                        <span className="count">{user.stats?.mediumSolved || 0}</span>
                        {user.stats?.totalMedium && user.stats.totalMedium > 0 && (
                          <span className="percentage">
                            {Math.round((user.stats.mediumSolved / user.stats.totalMedium) * 100)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="difficulty-cell hard">
                      <div className="difficulty-score">
                        <span className="count">{user.stats?.hardSolved || 0}</span>
                        {user.stats?.totalHard && user.stats.totalHard > 0 && (
                          <span className="percentage">
                            {Math.round((user.stats.hardSolved / user.stats.totalHard) * 100)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="score-cell">
                      <div className="reputation">
                        {user.stats?.reputation || 0}
                        {user.stats?.reputation > 0 && (
                          <span className="star">⭐</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No users found</h3>
              <p>
                {searchTerm ? `No users match "${searchTerm}"` : 'No users available on the leaderboard'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {users.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card total-users">
              <div className="stat-number">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card max-solved">
              <div className="stat-number">
                {Math.max(...users.map(u => u.stats?.totalSolved || 0))}
              </div>
              <div className="stat-label">Max Problems Solved</div>
            </div>
            <div className="stat-card max-reputation">
              <div className="stat-number">
                {Math.max(...users.map(u => u.stats?.reputation || 0))}
              </div>
              <div className="stat-label">Highest Reputation</div>
            </div>
            <div className="stat-card max-streak">
              <div className="stat-number">
                {Math.max(...users.map(u => u.stats?.streak || 0))}
              </div>
              <div className="stat-label">Longest Streak</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;