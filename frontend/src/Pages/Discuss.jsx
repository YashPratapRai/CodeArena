import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  Eye,
  MessageCircle,
  Clock,
  User,
  Tag,
  CheckCircle,
  Pin,
  Plus,
  X,
  TrendingUp,
  Flame,
  Clock4,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Reply,
  Edit,
  Trash2,
  Award,
  AlertCircle,
  Send
} from 'lucide-react';
import discussionService from '../services/discussion';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import '../styles/discuss.css';

const Discuss = () => {
  const { user, isAuthenticated } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 15,
    sortBy: 'recentActivity',
    search: '',
    tag: '',
    problemTitle: ''
  });
  const [pagination, setPagination] = useState({});
  const [popularTags, setPopularTags] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [problemResults, setProblemResults] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    problemTitle: '',
    tags: []
  });
  const [customTag, setCustomTag] = useState('');
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Safe authentication check
  const checkAuth = () => {
    if (typeof isAuthenticated === 'function') {
      return isAuthenticated();
    }
    return !!user;
  };

  // Get current user ID safely
  const getCurrentUserId = () => {
    return user?.id || user?._id;
  };

  // Fetch discussions
  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await discussionService.getDiscussions(filters);
      setDiscussions(response.discussions);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError(error.message || 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch popular tags
  const fetchPopularTags = async () => {
    try {
      const response = await discussionService.getTags();
      setPopularTags(response.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchDiscussions();
    fetchPopularTags();
  }, [fetchDiscussions]);

  // Search problems for discussion creation
  const searchProblems = async (query) => {
    if (query.length < 2) {
      setProblemResults([]);
      return;
    }
    try {
      const response = await discussionService.searchProblems(query);
      setProblemResults(response.problems);
    } catch (error) {
      console.error('Error searching problems:', error);
      setProblemResults([]);
    }
  };

  // Handle problem selection
  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setNewDiscussion(prev => ({ ...prev, problemTitle: problem.title }));
    setProblemSearch(problem.title);
    setProblemResults([]);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchDiscussions();
  };

  // Handle voting on discussions
  const handleVote = async (discussionId, voteType) => {
    if (!checkAuth()) {
      setError('Please login to vote');
      return;
    }

    try {
      setActionLoading(true);
      const response = await discussionService.voteDiscussion(discussionId, voteType);
      
      if (activeDiscussion && activeDiscussion._id === discussionId) {
        // Update active discussion
        const updatedDiscussion = await discussionService.getDiscussion(discussionId);
        setActiveDiscussion(updatedDiscussion.discussion);
      } else {
        // Update discussions list
        setDiscussions(prev => prev.map(discussion => 
          discussion._id === discussionId 
            ? { 
                ...discussion, 
                voteCount: response.voteCount,
                userVote: response.userVote
              }
            : discussion
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
      setError(error.message || 'Failed to vote');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle creating discussion
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!checkAuth()) {
      setError('Please login to create a discussion');
      return;
    }

    try {
      setActionLoading(true);
      await discussionService.createDiscussion(newDiscussion);
      setShowCreateModal(false);
      setNewDiscussion({ title: '', content: '', problemTitle: '', tags: [] });
      setSelectedProblem(null);
      setProblemSearch('');
      setError('');
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      setError(error.message || 'Failed to create discussion');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle adding tag
  const handleAddTag = (tag) => {
    if (!newDiscussion.tags.includes(tag)) {
      setNewDiscussion(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Handle removing tag
  const handleRemoveTag = (tagToRemove) => {
    setNewDiscussion(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle adding custom tag
  const handleAddCustomTag = () => {
    if (customTag.trim() && !newDiscussion.tags.includes(customTag.trim())) {
      setNewDiscussion(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  // FIXED: Handle adding comment
  const handleAddComment = async (discussionId, content) => {
    if (!checkAuth()) {
      setError('Please login to comment');
      return;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setActionLoading(true);
      await discussionService.addComment(discussionId, {
        content: content.trim()
      });
      
      // Refresh the discussion to show new comment
      const response = await discussionService.getDiscussion(discussionId);
      setActiveDiscussion(response.discussion);
      setCommentContent('');
      setError('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Failed to add comment');
    } finally {
      setActionLoading(false);
    }
  };

  // FIXED: Handle adding reply
  const handleAddReply = async (discussionId, commentId, content) => {
    if (!checkAuth()) {
      setError('Please login to reply');
      return;
    }

    if (!content.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      setActionLoading(true);
      await discussionService.addComment(discussionId, {
        content: content.trim(),
        parentCommentId: commentId
      });
      
      // Refresh the discussion to show new reply
      const response = await discussionService.getDiscussion(discussionId);
      setActiveDiscussion(response.discussion);
      setReplyingTo(null);
      setReplyContent('');
      setError('');
    } catch (error) {
      console.error('Error adding reply:', error);
      setError(error.message || 'Failed to add reply');
    } finally {
      setActionLoading(false);
    }
  };

  // FIXED: Handle voting on comments
  const handleVoteComment = async (discussionId, commentId, voteType, isReply = false, replyId = null) => {
    if (!checkAuth()) {
      setError('Please login to vote');
      return;
    }

    try {
      setActionLoading(true);
      
      // Prepare vote data
      const voteData = {
        voteType,
        isReply,
        replyId: isReply ? replyId : undefined
      };

      const response = await discussionService.voteComment(discussionId, commentId, voteData);

      // Update the active discussion with new vote data
      const discussionResponse = await discussionService.getDiscussion(discussionId);
      setActiveDiscussion(discussionResponse.discussion);
      
      setError('');
    } catch (error) {
      console.error('Error voting on comment:', error);
      setError(error.message || 'Failed to vote');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle marking solution
  const handleMarkSolution = async (discussionId, commentId) => {
    if (!checkAuth()) {
      setError('Please login to mark solution');
      return;
    }

    // Check if current user is the discussion author
    const currentUserId = getCurrentUserId();
    if (activeDiscussion?.author?._id !== currentUserId && activeDiscussion?.author?.id !== currentUserId) {
      setError('Only discussion author can mark solutions');
      return;
    }

    try {
      setActionLoading(true);
      await discussionService.markAsSolution(discussionId, commentId);
      
      // Refresh discussion
      const response = await discussionService.getDiscussion(discussionId);
      setActiveDiscussion(response.discussion);
      setError('');
    } catch (error) {
      console.error('Error marking solution:', error);
      setError(error.message || 'Failed to mark solution');
    } finally {
      setActionLoading(false);
    }
  };

  // Load discussion detail
  const loadDiscussionDetail = async (discussionId) => {
    try {
      setLoading(true);
      const response = await discussionService.getDiscussion(discussionId);
      setActiveDiscussion(response.discussion);
      setError('');
    } catch (error) {
      console.error('Error loading discussion:', error);
      setError(error.message || 'Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  // Get sort icon
  const getSortIcon = (sortBy) => {
    switch (sortBy) {
      case 'newest': return <Clock4 className="sort-icon" />;
      case 'mostVoted': return <TrendingUp className="sort-icon" />;
      case 'mostViewed': return <Eye className="sort-icon" />;
      case 'mostCommented': return <MessageCircle className="sort-icon" />;
      case 'recentActivity': return <Flame className="sort-icon" />;
      default: return <Flame className="sort-icon" />;
    }
  };

  // Get difficulty class
  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-medium';
    }
  };

  // Generate pagination
  const generatePagination = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // FIXED: Enhanced Comment Section Component
  const CommentSection = ({ discussion }) => {
    const [localCommentContent, setLocalCommentContent] = useState('');

    const handleSubmitComment = async (e) => {
      e.preventDefault();
      if (!localCommentContent.trim()) {
        setError('Comment cannot be empty');
        return;
      }
      
      try {
        setActionLoading(true);
        await discussionService.addComment(discussion._id, {
          content: localCommentContent.trim()
        });
        
        // Refresh the discussion
        const response = await discussionService.getDiscussion(discussion._id);
        setActiveDiscussion(response.discussion);
        setLocalCommentContent('');
        setError('');
      } catch (error) {
        console.error('Error adding comment:', error);
        setError(error.message || 'Failed to add comment');
      } finally {
        setActionLoading(false);
      }
    };

    return (
      <div className="comments-section">
        <h3 className="comments-title">
          Comments ({discussion.comments ? discussion.comments.length : 0})
        </h3>

        {/* Add Comment Form */}
        {checkAuth() && (
          <form onSubmit={handleSubmitComment} className="add-comment-form">
            <div className="comment-input-container">
              <textarea
                value={localCommentContent}
                onChange={(e) => setLocalCommentContent(e.target.value)}
                placeholder="Add your comment..."
                rows="4"
                className="comment-textarea"
                disabled={actionLoading}
              />
              <div className="comment-actions">
                <button
                  type="submit"
                  disabled={!localCommentContent.trim() || actionLoading}
                  className="submit-comment-btn"
                >
                  <Send className="btn-icon" />
                  {actionLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        {discussion.comments && discussion.comments.length > 0 ? (
          <div className="comments-list">
            {discussion.comments.map((comment) => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
                discussion={discussion}
                onVote={handleVoteComment}
                onReply={handleAddReply}
                onMarkSolution={handleMarkSolution}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        ) : (
          <div className="no-comments">
            <MessageSquare className="no-comments-icon" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    );
  };

  // FIXED: Comment Item Component
  const CommentItem = ({ comment, discussion, onVote, onReply, onMarkSolution, actionLoading }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleSubmitReply = async (e) => {
      e.preventDefault();
      if (!replyContent.trim()) {
        setError('Reply cannot be empty');
        return;
      }
      
      await onReply(discussion._id, comment._id, replyContent);
      setShowReplyInput(false);
      setReplyContent('');
    };

    // Check if current user can mark solution
    const canMarkSolution = () => {
      const currentUserId = getCurrentUserId();
      return discussion.author?._id === currentUserId || discussion.author?.id === currentUserId;
    };

    return (
      <div className={`comment-item ${comment.isSolution ? 'solution' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <div className="author-avatar small">
              {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="author-info">
              <span className="author-name">{comment.user?.username || 'Unknown'}</span>
              <span className="comment-time">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          {comment.isSolution && (
            <div className="solution-badge">
              <Award className="solution-icon" />
              Solution
            </div>
          )}
        </div>

        <div className="comment-content">
          {comment.content}
        </div>

        <div className="comment-actions">
          <div className="vote-section">
            <button
              onClick={() => onVote(discussion._id, comment._id, 'upvote')}
              className={`vote-btn upvote ${comment.userVote?.upvoted ? 'active' : ''}`}
              disabled={actionLoading}
            >
              <ArrowUp className="vote-icon" />
            </button>
            <span className="vote-count">{comment.voteCount || 0}</span>
            <button
              onClick={() => onVote(discussion._id, comment._id, 'downvote')}
              className={`vote-btn downvote ${comment.userVote?.downvoted ? 'active' : ''}`}
              disabled={actionLoading}
            >
              <ArrowDown className="vote-icon" />
            </button>
          </div>

          {checkAuth() && (
            <>
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="action-btn"
                disabled={actionLoading}
              >
                <Reply className="action-icon" />
                Reply
              </button>

              {canMarkSolution() && !discussion.solutionComment && (
                <button
                  onClick={() => onMarkSolution(discussion._id, comment._id)}
                  className="action-btn solution-btn"
                  disabled={actionLoading}
                >
                  <CheckCircle className="action-icon" />
                  Mark Solution
                </button>
              )}
            </>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies-section">
            {comment.replies.map((reply) => (
              <div key={reply._id} className="reply-item">
                <div className="comment-header">
                  <div className="comment-author">
                    <div className="author-avatar small">
                      {reply.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{reply.user?.username || 'Unknown'}</span>
                      <span className="comment-time">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="comment-content">
                  {reply.content}
                </div>

                <div className="comment-actions">
                  <div className="vote-section">
                    <button
                      onClick={() => onVote(discussion._id, comment._id, 'upvote', true, reply._id)}
                      className={`vote-btn upvote ${reply.userVote?.upvoted ? 'active' : ''}`}
                      disabled={actionLoading}
                    >
                      <ArrowUp className="vote-icon" />
                    </button>
                    <span className="vote-count">{reply.voteCount || 0}</span>
                    <button
                      onClick={() => onVote(discussion._id, comment._id, 'downvote', true, reply._id)}
                      className={`vote-btn downvote ${reply.userVote?.downvoted ? 'active' : ''}`}
                      disabled={actionLoading}
                    >
                      <ArrowDown className="vote-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply Input */}
        {showReplyInput && (
          <form onSubmit={handleSubmitReply} className="reply-input-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows="3"
              className="reply-textarea"
              disabled={actionLoading}
            />
            <div className="reply-actions">
              <button
                type="button"
                onClick={() => setShowReplyInput(false)}
                className="cancel-btn"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim() || actionLoading}
                className="submit-btn"
              >
                {actionLoading ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Discussion Detail Component
  const DiscussionDetail = ({ discussion, onBack }) => (
    <div className="discussion-detail">
      <button onClick={onBack} className="back-btn">
        <ChevronLeft className="back-icon" />
        Back to Discussions
      </button>
      
      <div className="discussion-detail-card">
        <div className="discussion-header">
          <h1 className="discussion-title">{discussion.title}</h1>
          {discussion.isPinned && (
            <div className="pinned-badge">
              <Pin className="pinned-icon" />
              Pinned
            </div>
          )}
        </div>

        <div className="discussion-meta">
          <div className="author-info">
            <div className="author-avatar">
              {discussion.author?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="author-name">{discussion.author?.username || 'Unknown'}</div>
              <div className="discussion-time">
                {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="discussion-stats">
            <div className="vote-section">
              <button
                onClick={() => handleVote(discussion._id, 'upvote')}
                className={`vote-btn upvote ${discussion.userVote?.upvoted ? 'active' : ''}`}
                disabled={actionLoading}
              >
                <ArrowUp className="vote-icon" />
              </button>
              <span className="vote-count">{discussion.voteCount || 0}</span>
              <button
                onClick={() => handleVote(discussion._id, 'downvote')}
                className={`vote-btn downvote ${discussion.userVote?.downvoted ? 'active' : ''}`}
                disabled={actionLoading}
              >
                <ArrowDown className="vote-icon" />
              </button>
            </div>
          </div>
        </div>

        {discussion.problem && (
          <div className="problem-info">
            <span className="problem-label">Problem:</span>
            <span className="problem-title">{discussion.problemTitle}</span>
            <span className={`difficulty-badge ${getDifficultyClass(discussion.problem.difficulty)}`}>
              {discussion.problem.difficulty}
            </span>
          </div>
        )}

        {discussion.tags && discussion.tags.length > 0 && (
          <div className="discussion-tags">
            {discussion.tags.map(tag => (
              <span key={tag} className="discussion-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="discussion-content">
          {discussion.content}
        </div>

        <div className="discussion-footer">
          <div className="view-count">
            <Eye className="view-icon" />
            {discussion.views || 0} views
          </div>
          <div className="comment-count">
            <MessageCircle className="comment-icon" />
            {discussion.commentCount || 0} comments
          </div>
        </div>
      </div>

      <CommentSection discussion={discussion} />
    </div>
  );

  // Create Discussion Modal
  const CreateDiscussionModal = () => (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2 className="modal-title">Create New Discussion</h2>
          <button
            onClick={() => setShowCreateModal(false)}
            className="modal-close-btn"
            disabled={actionLoading}
          >
            <X className="close-icon" />
          </button>
        </div>
        
        <form onSubmit={handleCreateDiscussion} className="modal-form">
          <div className="form-group">
            <label className="form-label">Problem *</label>
            <div className="problem-search-container">
              <input
                type="text"
                value={problemSearch}
                onChange={(e) => {
                  setProblemSearch(e.target.value);
                  searchProblems(e.target.value);
                }}
                className="form-input"
                placeholder="Search for a problem..."
                required
                disabled={actionLoading}
              />
              {problemResults.length > 0 && (
                <div className="problem-results">
                  {problemResults.map(problem => (
                    <div
                      key={problem._id}
                      onClick={() => handleProblemSelect(problem)}
                      className="problem-result"
                    >
                      <span className="problem-title">{problem.title}</span>
                      <span className={`difficulty-badge ${getDifficultyClass(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedProblem && (
              <div className="selected-problem">
                Selected: <strong>{selectedProblem.title}</strong>
                <span className={`difficulty-badge ${getDifficultyClass(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              required
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              className="form-input"
              placeholder="What's your question or topic?"
              disabled={actionLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea
              required
              rows={6}
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
              className="form-textarea"
              placeholder="Describe your question, share your approach, or discuss the problem..."
              disabled={actionLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="selected-tags">
              {newDiscussion.tags.map(tag => (
                <span key={tag} className="selected-tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag-btn"
                    disabled={actionLoading}
                  >
                    <X className="remove-icon" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="tag-input-group">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                className="tag-input"
                placeholder="Add custom tag..."
                disabled={actionLoading}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="add-tag-btn"
                disabled={actionLoading}
              >
                Add Tag
              </button>
            </div>
            
            <div className="popular-tags">
              {popularTags.slice(0, 8).map(tag => (
                <button
                  type="button"
                  key={tag.name}
                  onClick={() => handleAddTag(tag.name)}
                  disabled={newDiscussion.tags.includes(tag.name) || actionLoading}
                  className="popular-tag"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="cancel-btn"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={actionLoading || !newDiscussion.title || !newDiscussion.content || !newDiscussion.problemTitle}
            >
              {actionLoading ? 'Creating...' : 'Create Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Loading state
  if (loading && discussions.length === 0) {
    return (
      <div className="discuss-loading">
        <div className="discuss-loading-spinner"></div>
        <p className="loading-text">Loading discussions...</p>
      </div>
    );
  }

  return (
    <div className="discuss-container">
      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <AlertCircle className="error-icon" />
          <span className="error-message">{error}</span>
          <button onClick={() => setError('')} className="error-close">
            <X className="close-icon" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="discuss-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="header-title">Community Discussions</h1>
            <p className="header-subtitle">
              Join the conversation, share insights, and help fellow developers solve problems
            </p>
          </div>
          {checkAuth() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="create-discussion-btn"
              disabled={actionLoading}
            >
              <Plus className="btn-icon" />
              New Discussion
            </button>
          )}
        </div>
      </header>

      <div className="discuss-content">
        {activeDiscussion ? (
          <DiscussionDetail 
            discussion={activeDiscussion}
            onBack={() => setActiveDiscussion(null)}
          />
        ) : (
          <div className="content-grid">
            {/* Sidebar */}
            <aside className="sidebar">
              {/* Search */}
              <div className="sidebar-card">
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-container">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="search-input"
                      disabled={actionLoading}
                    />
                  </div>
                </form>
              </div>

              {/* Filters */}
              <div className="sidebar-card">
                <h3 className="sidebar-title">
                  <Filter className="title-icon" />
                  Sort By
                </h3>
                <div className="filter-options">
                  {[
                    { value: 'recentActivity', label: 'Recent Activity' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'mostVoted', label: 'Most Voted' },
                    { value: 'mostViewed', label: 'Most Viewed' },
                    { value: 'mostCommented', label: 'Most Comments' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('sortBy', option.value)}
                      className={`filter-btn ${filters.sortBy === option.value ? 'active' : ''}`}
                      disabled={actionLoading}
                    >
                      {getSortIcon(option.value)}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="sidebar-card">
                <h3 className="sidebar-title">
                  <Tag className="title-icon" />
                  Popular Tags
                </h3>
                <div className="tags-container">
                  {popularTags.slice(0, 12).map(tag => (
                    <button
                      key={tag.name}
                      onClick={() => handleFilterChange('tag', tag.name)}
                      className={`tag ${filters.tag === tag.name ? 'active' : ''}`}
                      disabled={actionLoading}
                    >
                      {tag.name} <span className="tag-count">({tag.count})</span>
                    </button>
                  ))}
                </div>
                {filters.tag && (
                  <button
                    onClick={() => handleFilterChange('tag', '')}
                    className="clear-tags-btn"
                    disabled={actionLoading}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
              <div className="discussions-card">
                {discussions.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare className="empty-icon" />
                    <h3 className="empty-title">No discussions found</h3>
                    <p className="empty-description">
                      {filters.search || filters.tag 
                        ? 'Try adjusting your search or filters' 
                        : 'Be the first to start a discussion!'}
                    </p>
                    {checkAuth() && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="empty-action-btn"
                        disabled={actionLoading}
                      >
                        Start a Discussion
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="discussions-list">
                    {discussions.map((discussion, index) => (
                      <div 
                        key={discussion._id} 
                        className={`discussion-item ${discussion.isPinned ? 'pinned' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => loadDiscussionDetail(discussion._id)}
                      >
                        {discussion.isPinned && (
                          <div className="pinned-badge">
                            <Pin className="pinned-icon" />
                            Pinned Discussion
                          </div>
                        )}
                        
                        <div className="discussion-content">
                          <div className="discussion-main">
                            <div className="author-avatar">
                              {discussion.author?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="discussion-info">
                              <h3 className="discussion-title">{discussion.title}</h3>
                              
                              <div className="discussion-meta">
                                <span className="meta-item">
                                  <User className="meta-icon" />
                                  {discussion.author?.username || 'Unknown'}
                                </span>
                                <span className="meta-item">
                                  <Clock className="meta-icon" />
                                  {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                                </span>
                                {discussion.problem && (
                                  <span className={`difficulty-badge ${getDifficultyClass(discussion.problem.difficulty)}`}>
                                    {discussion.problem.title}
                                  </span>
                                )}
                              </div>

                              {discussion.tags && discussion.tags.length > 0 && (
                                <div className="discussion-tags">
                                  {discussion.tags.map(tag => (
                                    <span key={tag} className="discussion-tag">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="discussion-stats">
                            <div className="vote-section">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(discussion._id, 'upvote');
                                }}
                                className={`vote-btn upvote ${discussion.userVote?.upvoted ? 'active' : ''}`}
                                disabled={actionLoading}
                              >
                                <ArrowUp className="vote-icon" />
                              </button>
                              <span className="vote-count">{discussion.voteCount || 0}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(discussion._id, 'downvote');
                                }}
                                className={`vote-btn downvote ${discussion.userVote?.downvoted ? 'active' : ''}`}
                                disabled={actionLoading}
                              >
                                <ArrowDown className="vote-icon" />
                              </button>
                            </div>

                            <div className="stat-group">
                              <div className="stat">
                                <MessageCircle className="stat-icon" />
                                <span className="stat-count">{discussion.commentCount || 0}</span>
                                <span className="stat-label">replies</span>
                              </div>
                              <div className="stat">
                                <Eye className="stat-icon" />
                                <span className="stat-count">{discussion.views || 0}</span>
                                <span className="stat-label">views</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {discussion.solutionComment && (
                          <div className="solution-badge">
                            <CheckCircle className="solution-icon" />
                            Solution Available
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev || actionLoading}
                    className="pagination-btn prev"
                  >
                    <ChevronLeft className="pagination-icon" />
                    Previous
                  </button>
                  
                  <div className="pagination-pages">
                    {generatePagination().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handleFilterChange('page', page)}
                          className={`pagination-page ${page === pagination.currentPage ? 'active' : ''}`}
                          disabled={actionLoading}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    disabled={!pagination.hasNext || actionLoading}
                    className="pagination-btn next"
                  >
                    Next
                    <ChevronRight className="pagination-icon" />
                  </button>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {showCreateModal && <CreateDiscussionModal />}
    </div>
  );
};

export default Discuss;