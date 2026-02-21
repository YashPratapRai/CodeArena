import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import problemService from '../services/problems';
import SolutionViewModal from '../components/SolutionViewModal'; // Make sure to import this
import '../styles/Problems.css';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    status: '',
    tags: '',
    search: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [solutions, setSolutions] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchProblems = async () => {
  try {
    setLoading(true);
    const response = await problemService.getProblems(filters);
    
    // 🔴 FIX: Your API returns problems directly, not inside response.data.data
    // The response structure might be different depending on your problemService
    
    console.log('API Response:', response); // Add this to debug
    
    // Try different possible structures
    const problemsData = response.data?.problems || // Direct from API
                        response.data?.data?.problems || // Nested structure
                        response.data || // Just the array
                        [];
    
    setProblems(problemsData);
    setTotalPages(response.data?.totalPages || 1);
    extractTags(problemsData);
    calculateStats(problemsData);
  } catch (error) {
    console.error('Error fetching problems:', error);
  } finally {
    setLoading(false);
  }
};

  const handleViewSolution = async (problem) => {
    try {
      const response = await problemService.getSolution(problem._id);
      if (response.data) {
        setSelectedProblem(problem);
        setSolutions(prev => ({
          ...prev,
          [problem._id]: response.data
        }));
        setShowSolutionModal(true);
      }
    } catch (error) {
      console.error('Error fetching solution:', error);
      // Optionally show an error message to the user
      alert('Failed to load solution. Please try again.');
    }
  };

  const calculateStats = (problemsList) => {
    const total = problemsList.length;
    const easy = problemsList.filter(p => p.difficulty === 'easy').length;
    const medium = problemsList.filter(p => p.difficulty === 'medium').length;
    const hard = problemsList.filter(p => p.difficulty === 'hard').length;
    
    setStats({
      total,
      easy,
      medium,
      hard
    });
  };

  const extractTags = (problemsList) => {
    const allTags = problemsList.reduce((tags, problem) => {
      return [...tags, ...(problem.tags || [])];
    }, []);
    const uniqueTags = [...new Set(allTags)];
    setAvailableTags(uniqueTags);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleTagSelect = (tag) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    handleFilterChange('tags', newSelectedTags.join(','));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      status: '',
      tags: '',
      search: '',
      page: 1,
      limit: 50
    });
    setSelectedTags([]);
    setShowMobileFilters(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-easy';
    }
  };

  const getStatusIcon = (problem) => {
    if (problem.solved) return '✅';
    if (problem.attempted) return '🟡';
    return '';
  };

  if (loading && problems.length === 0) {
    return (
      <div className="problems-container">
        <div className="problems-loading">
          <div className="loading-spinner large"></div>
          <h2>Loading Problems...</h2>
          <p>Preparing your coding journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="problems-container">
      <div className="problems-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="header-title">Problem List</h1>
            <Link to="/" className="home-button">
              <svg className="home-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>

            <button 
              className="mobile-filter-toggle"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Problems</div>
            </div>
            <div className="stat-card easy">
              <div className="stat-number">{stats.easy}</div>
              <div className="stat-label">Easy</div>
            </div>
            <div className="stat-card medium">
              <div className="stat-number">{stats.medium}</div>
              <div className="stat-label">Medium</div>
            </div>
            <div className="stat-card hard">
              <div className="stat-number">{stats.hard}</div>
              <div className="stat-label">Hard</div>
            </div>
          </div>
        </div>
      </div>

      <div className="problems-content">
        <div className={`filters-sidebar ${showMobileFilters ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button 
              className="close-mobile-filters"
              onClick={() => setShowMobileFilters(false)}
            >
              ×
            </button>
          </div>
          
          <div className="filter-group">
            <h3 className="filter-title">Difficulty</h3>
            <div className="difficulty-filters">
              <button
                className={`difficulty-filter-btn ${filters.difficulty === '' ? 'active' : ''}`}
                onClick={() => handleFilterChange('difficulty', '')}
              >
                All
              </button>
              <button
                className={`difficulty-filter-btn easy ${filters.difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => handleFilterChange('difficulty', 'easy')}
              >
                Easy
              </button>
              <button
                className={`difficulty-filter-btn medium ${filters.difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => handleFilterChange('difficulty', 'medium')}
              >
                Medium
              </button>
              <button
                className={`difficulty-filter-btn hard ${filters.difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => handleFilterChange('difficulty', 'hard')}
              >
                Hard
              </button>
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Status</h3>
            <div className="status-filters">
              <button
                className={`status-filter-btn ${filters.status === '' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', '')}
              >
                All
              </button>
              <button
                className={`status-filter-btn ${filters.status === 'solved' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', 'solved')}
              >
                Solved
              </button>
              <button
                className={`status-filter-btn ${filters.status === 'attempted' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', 'attempted')}
              >
                Attempted
              </button>
              <button
                className={`status-filter-btn ${filters.status === 'todo' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', 'todo')}
              >
                Todo
              </button>
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Tags</h3>
            <div className="tags-list">
              {availableTags.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            {availableTags.length > 15 && (
              <button className="show-more-tags">
                Show More...
              </button>
            )}
          </div>

          {(filters.difficulty || filters.status || selectedTags.length > 0 || filters.search) && (
            <button onClick={clearFilters} className="clear-all-filters">
              Clear All Filters
            </button>
          )}
        </div>

        <div className="problems-main">
          <div className="table-header">
            <div className="search-container">
              <div className="search-box">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
                {filters.search && (
                  <button 
                    onClick={() => handleFilterChange('search', '')}
                    className="clear-search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="table-actions">
              <div className="problems-count">
                {problems.length} problems
              </div>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="selected-tags-bar">
              <span className="selected-tags-label">Selected tags:</span>
              {selectedTags.map(tag => (
                <span key={tag} className="selected-tag">
                  {tag}
                  <button onClick={() => handleTagSelect(tag)} className="remove-tag">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="problems-table-container">
            <table className="problems-table">
              <thead>
                <tr>
                  <th className="status-col">Status</th>
                  <th className="title-col">Title</th>
                  <th className="solution-col">Solution</th>
                  <th className="difficulty-col">Difficulty</th>
                  <th className="acceptance-col">Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => (
                  <tr key={problem._id} className="problem-row">
                    <td className="status-cell">
                      <span className="status-icon">
                        {getStatusIcon(problem)}
                      </span>
                    </td>
                    <td className="title-cell">
                      <Link to={`/problems/${problem._id}`} className="problem-link">
                        {(filters.page - 1) * filters.limit + index + 1}. {problem.title}
                      </Link>
                      <div className="problem-tags">
                        {problem.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="problem-tag">{tag}</span>
                        ))}
                        {problem.tags && problem.tags.length > 2 && (
                          <span className="problem-tag-more">+{problem.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="solution-cell">
                      {problem.hasSolution && (
                        <button 
                          onClick={() => handleViewSolution(problem)}
                          className="solution-btn"
                        >
                          <svg className="solution-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Solution
                        </button>
                      )}
                    </td>
                    <td className="difficulty-cell">
                      <span className={`difficulty-badge ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="acceptance-cell">
                      <div className="acceptance-rate">
                        {problem.acceptanceRate ? `${problem.acceptanceRate.toFixed(1)}%` : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {problems.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>No problems found</h3>
              <p>Try adjusting your search criteria or clear filters to see all problems</p>
              <button onClick={clearFilters} className="browse-all-btn">
                Browse All Problems
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                className="pagination-btn prev"
              >
                <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="pagination-pages">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`pagination-page ${filters.page === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="pagination-ellipsis">...</span>}
              </div>

              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page === totalPages}
                className="pagination-btn next"
              >
                Next
                <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Solution View Modal */}
      {showSolutionModal && selectedProblem && solutions[selectedProblem._id] && (
        <SolutionViewModal
          problem={selectedProblem}
          solution={solutions[selectedProblem._id]}
          onClose={() => {
            setShowSolutionModal(false);
            setSelectedProblem(null);
          }}
        />
      )}

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div 
          className="mobile-filter-overlay"
          onClick={() => setShowMobileFilters(false)}
        ></div>
      )}
    </div>
  );
};

export default Problems;