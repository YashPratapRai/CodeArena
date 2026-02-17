import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import solutionService from '../services/solutions';
import problemService from '../services/problems';
import { useAuth } from '../context/AuthContext';
import '../styles/SolutionsList.css';

const SolutionsList = () => {
  const { problemId } = useParams();
  const { user } = useAuth();
  
  const [solutions, setSolutions] = useState([]);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    language: ''
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchProblem();
    fetchSolutions();
  }, [problemId, filters]);

  const fetchProblem = async () => {
    try {
      const response = await problemService.getProblem(problemId);
      setProblem(response.data.problem);
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await solutionService.getSolutionsByProblem(problemId, filters);
      setSolutions(response.data.solutions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleVote = async (solutionId, type) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = type === 'upvote' 
        ? await solutionService.upvoteSolution(solutionId)
        : await solutionService.downvoteSolution(solutionId);

      // Update the solution in the list
      setSolutions(prev => prev.map(solution => 
        solution._id === solutionId 
          ? { 
              ...solution, 
              upvotes: response.data.upvotes,
              downvotes: response.data.downvotes
            }
          : solution
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getVoteCount = (solution) => {
    return solution.upvotes.length - solution.downvotes.length;
  };

  if (loading && solutions.length === 0) {
    return (
      <div className="solutions-loading">
        <div className="loading-spinner"></div>
        <p>Loading solutions...</p>
      </div>
    );
  }

  return (
    <div className="solutions-container">
      {/* Header */}
      <div className="solutions-header">
        <div className="header-content">
          <div className="breadcrumb">
            <Link to="/problems" className="breadcrumb-link">Problems</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to={`/problems/${problemId}`} className="breadcrumb-link">
              {problem?.title || 'Problem'}
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Solutions</span>
          </div>
          
          <h1 className="solutions-title">
            Solutions for: {problem?.title}
          </h1>
          
          <div className="solutions-stats">
            <span className="stat">
              <strong>{solutions.length}</strong> Solutions
            </span>
            <span className="stat">
              <strong>{problem?.difficulty}</strong> Difficulty
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="solutions-content">
        {/* Filters Sidebar */}
        <div className="solutions-sidebar">
          <div className="filter-group">
            <h3>Sort By</h3>
            <select 
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="filter-select"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="upvotes-desc">Most Votes</option>
              <option value="views-desc">Most Views</option>
            </select>
          </div>

          <div className="filter-group">
            <h3>Language</h3>
            <select 
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="filter-select"
            >
              <option value="">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>

          {user && (
            <button 
              className="create-solution-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Add Solution
            </button>
          )}
        </div>

        {/* Solutions List */}
        <div className="solutions-list">
          {solutions.length === 0 ? (
            <div className="no-solutions">
              <div className="no-solutions-icon">💡</div>
              <h3>No Solutions Yet</h3>
              <p>Be the first to share your solution for this problem!</p>
              {user && (
                <button 
                  className="create-first-solution-btn"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create First Solution
                </button>
              )}
            </div>
          ) : (
            solutions.map(solution => (
              <SolutionCard 
                key={solution._id}
                solution={solution}
                onVote={handleVote}
                currentUserId={user?._id}
              />
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="solutions-pagination">
              <button
                disabled={filters.page === 1}
                onClick={() => handleFilterChange('page', filters.page - 1)}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {filters.page} of {totalPages}
              </span>
              
              <button
                disabled={filters.page === totalPages}
                onClick={() => handleFilterChange('page', filters.page + 1)}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Solution Modal */}
      {showCreateForm && (
        <CreateSolutionForm 
          problemId={problemId}
          problemTitle={problem?.title}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchSolutions();
          }}
        />
      )}
    </div>
  );
};

const SolutionCard = ({ solution, onVote, currentUserId }) => {
  const hasUpvoted = solution.upvotes.includes(currentUserId);
  const hasDownvoted = solution.downvotes.includes(currentUserId);
  const voteCount = getVoteCount(solution);

  return (
    <div className="solution-card">
      <div className="solution-votes">
        <button 
          className={`vote-btn upvote ${hasUpvoted ? 'active' : ''}`}
          onClick={() => onVote(solution._id, 'upvote')}
        >
          ▲
        </button>
        <span className="vote-count">{voteCount}</span>
        <button 
          className={`vote-btn downvote ${hasDownvoted ? 'active' : ''}`}
          onClick={() => onVote(solution._id, 'downvote')}
        >
          ▼
        </button>
      </div>

      <div className="solution-content">
        <div className="solution-header">
          <h3 className="solution-title">
            <Link to={`/solutions/${solution._id}`}>
              {solution.title}
            </Link>
          </h3>
          <div className="solution-meta">
            <span className="solution-author">
              By {solution.author?.username}
            </span>
            <span className="solution-date">
              {new Date(solution.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <p className="solution-description">
          {solution.description}
        </p>

        <div className="solution-footer">
          <div className="solution-stats">
            <span className="stat">
              <strong>{solution.views}</strong> views
            </span>
            <span className="stat">
              <strong>{solution.upvotes.length}</strong> upvotes
            </span>
            {solution.youtubeUrl && (
              <span className="stat youtube-badge">
                🎥 Video Solution
              </span>
            )}
          </div>

          <div className="solution-languages">
            {solution.code.map((code, index) => (
              <span key={index} className="language-tag">
                {code.language}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsList;