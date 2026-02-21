import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import problemService from '../../services/problems';
import ProblemForm from './ProblemForm';
import '../../styles/AdminPanel.css';
import SolutionManagement from './SolutionManagement';

const AdminPanel = () => {  
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('problems');
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedProblemForSolution, setSelectedProblemForSolution] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProblems();
      fetchStats();
    }
  }, [user]);

  const fetchProblems = async () => {
    try {
      const response = await problemService.getProblems({ limit: 100 });
      setProblems(response.data.problems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await problemService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateProblem = () => {
    setEditingProblem(null);
    setShowForm(true);
  };

  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    setShowForm(true);
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    try {
      await problemService.deleteProblem(problemId);
      setProblems(problems.filter(p => p._id !== problemId));
      alert('Problem deleted successfully!');
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete problem');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProblem(null);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingProblem(null);
    fetchProblems();
    fetchStats();
  };

  const handleManageSolution = (problem) => {
    setSelectedProblemForSolution(problem);
    setShowSolutionModal(true);
  };

  const handleSolutionSave = () => {
    fetchProblems(); // Refresh the problems list
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-easy';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-container">
        <div className="admin-error">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ProblemForm
        problem={editingProblem}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-section">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Manage problems and platform content</p>
        </div>
        <button
          onClick={handleCreateProblem}
          className="admin-create-btn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Problem
        </button>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon total-problems">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293A1 1 0 0118 6v10a1 1 0 01-.293.707L14 14.414V3.586l3.707 1.707z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalProblems || 0}</h3>
            <p className="stat-label">Total Problems</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon easy-problems">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {stats.byDifficulty?.find(d => d._id === 'easy')?.count || 0}
            </h3>
            <p className="stat-label">Easy Problems</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon medium-problems">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {stats.byDifficulty?.find(d => d._id === 'medium')?.count || 0}
            </h3>
            <p className="stat-label">Medium Problems</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon hard-problems">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {stats.byDifficulty?.find(d => d._id === 'hard')?.count || 0}
            </h3>
            <p className="stat-label">Hard Problems</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          Problems Management
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Platform Analytics
        </button>
      </div>

      {/* Problems Table */}
      {activeTab === 'problems' && (
        <div className="problems-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading problems...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="problems-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Acceptance</th>
                    <th>Submissions</th>
                    <th>Tags</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => (
                    <tr key={problem._id}>
                      <td className="problem-title">
                        <span>{problem.title}</span>
                      </td>
                      <td>
                        <span className={`difficulty-badge ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="acceptance-rate">
                        {problem.acceptanceRate?.toFixed(1) || 0}%
                      </td>
                      <td className="submissions-count">
                        {problem.totalSubmissions || 0}
                      </td>
                      <td className="problem-tags">
                        <div className="tags-container">
                          {problem.tags?.slice(0, 2).map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))}
                          {problem.tags?.length > 2 && (
                            <span className="tag-more">
                              +{problem.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${problem.isActive ? 'active' : 'inactive'}`}>
                          {problem.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="actions-buttons">
                          <button
                            onClick={() => handleEditProblem(problem)}
                            className="action-btn edit-btn"
                            title="Edit Problem"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Solution Management Button */}
                          <button
                            onClick={() => handleManageSolution(problem)}
                            className="action-btn solution-btn"
                            title="Manage Solution"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProblem(problem._id)}
                            className="action-btn delete-btn"
                            title="Delete Problem"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {problems.length === 0 && (
                <div className="empty-state">
                  <svg className="empty-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3>No problems found</h3>
                  <p>Create your first problem to get started</p>
                  <button
                    onClick={handleCreateProblem}
                    className="create-first-btn"
                  >
                    Create First Problem
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-tab">
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Submission Analytics</h3>
              <div className="analytics-content">
                <div className="analytics-item">
                  <span className="analytics-label">Total Submissions:</span>
                  <span className="analytics-value">{stats.totalSubmissions || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Average Acceptance:</span>
                  <span className="analytics-value">
                    {stats.byDifficulty ? 
                      (stats.byDifficulty.reduce((acc, curr) => acc + (curr.totalAccepted / curr.totalSubmissions * 100), 0) / stats.byDifficulty.length).toFixed(1) 
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Difficulty Distribution</h3>
              <div className="difficulty-distribution">
                {stats.byDifficulty?.map((diff) => (
                  <div key={diff._id} className="distribution-item">
                    <div className="distribution-header">
                      <span className={`difficulty-label ${getDifficultyColor(diff._id)}`}>
                        {diff._id}
                      </span>
                      <span className="distribution-count">{diff.count}</span>
                    </div>
                    <div className="distribution-bar">
                      <div 
                        className={`distribution-fill ${getDifficultyColor(diff._id)}`}
                        style={{ 
                          width: `${(diff.count / stats.totalProblems) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Solution Management Modal */}
      {showSolutionModal && selectedProblemForSolution && (
        <SolutionManagement
          problem={selectedProblemForSolution}
          onClose={() => {
            setShowSolutionModal(false);
            setSelectedProblemForSolution(null);
          }}
          onSave={handleSolutionSave}
        />
      )}
    </div>
  );
};

export default AdminPanel;