import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Add this import
import problemService from '../../services/problems';
import '../../styles/SolutionManagement.css';

const SolutionManagement = ({ problem, onClose, onSave }) => {
  const { user } = useAuth(); // Add this line
  const [loading, setLoading] = useState(false);
  const [solutionType, setSolutionType] = useState('text'); // 'text' or 'video'
  const [solutionData, setSolutionData] = useState({
    textSolution: '',
    videoSolution: {
      url: '',
      title: '',
      platform: 'youtube', // youtube, vimeo, custom
      duration: '',
      thumbnail: ''
    },
    isPublished: true,
    additionalResources: []
  });
  const [currentResource, setCurrentResource] = useState({
    title: '',
    url: '',
    type: 'article'
  });
  const [errors, setErrors] = useState({});
  const [existingSolution, setExistingSolution] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      alert('You need admin privileges to manage solutions');
      onClose();
      return;
    }
    
    fetchExistingSolution();
  }, [problem, user, onClose]);

  const fetchExistingSolution = async () => {
    try {
      setLoading(true);
      const response = await problemService.getSolution(problem._id);
      if (response.data) {
        setExistingSolution(response.data);
        setSolutionData({
          textSolution: response.data.textSolution || '',
          videoSolution: response.data.videoSolution || {
            url: '',
            title: '',
            platform: 'youtube',
            duration: '',
            thumbnail: ''
          },
          isPublished: response.data.isPublished !== undefined ? response.data.isPublished : true,
          additionalResources: response.data.additionalResources || []
        });
        setSolutionType(response.data.videoSolution?.url ? 'video' : 'text');
      }
    } catch (error) {
      console.error('Error fetching solution:', error);
      // Don't show alert for 404 as it might just mean no solution exists yet
      if (error.response?.status !== 404) {
        alert('Failed to fetch existing solution');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTextSolutionChange = (value) => {
    setSolutionData(prev => ({
      ...prev,
      textSolution: value
    }));
    if (errors.textSolution) {
      setErrors(prev => ({ ...prev, textSolution: '' }));
    }
  };

  const handleVideoSolutionChange = (field, value) => {
    setSolutionData(prev => ({
      ...prev,
      videoSolution: {
        ...prev.videoSolution,
        [field]: value
      }
    }));
    if (errors[`videoSolution.${field}`]) {
      setErrors(prev => ({ ...prev, [`videoSolution.${field}`]: '' }));
    }
  };

  const handleAddResource = () => {
    if (!currentResource.title.trim() || !currentResource.url.trim()) {
      setErrors(prev => ({
        ...prev,
        resource: 'Both title and URL are required'
      }));
      return;
    }

    setSolutionData(prev => ({
      ...prev,
      additionalResources: [...prev.additionalResources, { ...currentResource }]
    }));
    setCurrentResource({
      title: '',
      url: '',
      type: 'article'
    });
    setErrors(prev => ({ ...prev, resource: '' }));
  };

  const handleRemoveResource = (index) => {
    setSolutionData(prev => ({
      ...prev,
      additionalResources: prev.additionalResources.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (solutionType === 'text' && !solutionData.textSolution.trim()) {
      newErrors.textSolution = 'Text solution is required';
    }

    if (solutionType === 'video') {
      if (!solutionData.videoSolution.url.trim()) {
        newErrors['videoSolution.url'] = 'Video URL is required';
      }
      if (!solutionData.videoSolution.title.trim()) {
        newErrors['videoSolution.title'] = 'Video title is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const extractYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleVideoUrlChange = (url) => {
    handleVideoSolutionChange('url', url);
    
    // Auto-generate thumbnail if it's a YouTube URL
    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      handleVideoSolutionChange('thumbnail', `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      handleVideoSolutionChange('platform', 'youtube');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Double-check admin status
    if (!user || user.role !== 'admin') {
      alert('You need admin privileges to save solutions');
      onClose();
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        textSolution: solutionData.textSolution,
        videoSolution: solutionData.videoSolution.url ? solutionData.videoSolution : null,
        additionalResources: solutionData.additionalResources,
        isPublished: solutionData.isPublished
      };

      // If video type but no video URL, don't send videoSolution
      if (solutionType === 'video' && !submitData.videoSolution?.url) {
        submitData.videoSolution = null;
      }

      console.log('Submitting solution data:', submitData);
      console.log('Problem ID:', problem._id);

      const response = await problemService.saveSolution(problem._id, submitData);
      console.log('Save response:', response);
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving solution:', error);
      
      // Better error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          alert('Your session has expired. Please login again.');
        } else if (error.response.status === 403) {
          alert('You do not have permission to perform this action.');
        } else if (error.response.status === 404) {
          alert('API endpoint not found. Please check your server configuration.');
        } else {
          alert(error.response.data?.message || 'Failed to save solution. Please try again.');
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('No response from server. Please check if the backend is running.');
      } else {
        console.error('Error message:', error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    const videoId = extractYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading && !solutionData.textSolution && !existingSolution) {
    return (
      <div className="solution-modal">
        <div className="solution-modal-content loading">
          <div className="loading-spinner"></div>
          <p>Loading solution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="solution-modal">
      <div className="solution-modal-content">
        <div className="solution-modal-header">
          <h2>{existingSolution ? 'Edit Solution' : 'Add Solution'} - {problem.title}</h2>
          <button onClick={onClose} className="close-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="solution-form">
          {/* Solution Type Toggle */}
          <div className="solution-type-toggle">
            <button
              type="button"
              className={`type-btn ${solutionType === 'text' ? 'active' : ''}`}
              onClick={() => setSolutionType('text')}
            >
              <svg className="type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Text Solution
            </button>
            <button
              type="button"
              className={`type-btn ${solutionType === 'video' ? 'active' : ''}`}
              onClick={() => setSolutionType('video')}
            >
              <svg className="type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Video Solution
            </button>
          </div>

          {/* Text Solution Editor */}
          {solutionType === 'text' && (
            <div className="text-solution-section">
              <div className="form-group">
                <label className="form-label">
                  Solution Explanation *
                </label>
                <div className="text-editor-container">
                  <textarea
                    value={solutionData.textSolution}
                    onChange={(e) => handleTextSolutionChange(e.target.value)}
                    className={`form-textarea ${errors.textSolution ? 'error' : ''}`}
                    placeholder="Write a detailed explanation of the solution..."
                    rows={12}
                  />
                  <div className="editor-toolbar">
                    <button type="button" className="toolbar-btn" title="Bold">
                      <strong>B</strong>
                    </button>
                    <button type="button" className="toolbar-btn" title="Italic">
                      <em>I</em>
                    </button>
                    <button type="button" className="toolbar-btn" title="Code">
                      {'< >'}
                    </button>
                    <button type="button" className="toolbar-btn" title="Link">
                      🔗
                    </button>
                  </div>
                </div>
                {errors.textSolution && (
                  <span className="error-message">{errors.textSolution}</span>
                )}
                <small className="form-hint">
                  You can use Markdown formatting for better readability
                </small>
              </div>
            </div>
          )}

          {/* Video Solution Section */}
          {solutionType === 'video' && (
            <div className="video-solution-section">
              <div className="form-group">
                <label className="form-label">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={solutionData.videoSolution.url}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  className={`form-input ${errors['videoSolution.url'] ? 'error' : ''}`}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {errors['videoSolution.url'] && (
                  <span className="error-message">{errors['videoSolution.url']}</span>
                )}
                <small className="form-hint">
                  Supports YouTube, Vimeo, and other video platforms
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={solutionData.videoSolution.title}
                  onChange={(e) => handleVideoSolutionChange('title', e.target.value)}
                  className={`form-input ${errors['videoSolution.title'] ? 'error' : ''}`}
                  placeholder="Enter video title"
                />
                {errors['videoSolution.title'] && (
                  <span className="error-message">{errors['videoSolution.title']}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label className="form-label">
                    Platform
                  </label>
                  <select
                    value={solutionData.videoSolution.platform}
                    onChange={(e) => handleVideoSolutionChange('platform', e.target.value)}
                    className="form-select"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label className="form-label">
                    Duration (optional)
                  </label>
                  <input
                    type="text"
                    value={solutionData.videoSolution.duration}
                    onChange={(e) => handleVideoSolutionChange('duration', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 10:30"
                  />
                </div>
              </div>

              {/* Video Preview */}
              {solutionData.videoSolution.url && (
                <div className="video-preview">
                  <h4>Preview</h4>
                  {solutionData.videoSolution.platform === 'youtube' ? (
                    <iframe
                      src={getYoutubeEmbedUrl(solutionData.videoSolution.url)}
                      title="Video Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="video-placeholder">
                      <video controls src={solutionData.videoSolution.url}>
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Additional Resources */}
          <div className="resources-section">
            <h3 className="section-title">Additional Resources (Optional)</h3>
            
            <div className="add-resource-form">
              <div className="resource-input-row">
                <input
                  type="text"
                  value={currentResource.title}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                  placeholder="Resource title"
                />
                <select
                  value={currentResource.type}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, type: e.target.value }))}
                  className="form-select resource-type"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="documentation">Documentation</option>
                  <option value="github">GitHub</option>
                </select>
                <input
                  type="url"
                  value={currentResource.url}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, url: e.target.value }))}
                  className="form-input"
                  placeholder="Resource URL"
                />
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="add-resource-btn"
                >
                  Add
                </button>
              </div>
              {errors.resource && <span className="error-message">{errors.resource}</span>}
            </div>

            {/* Resources List */}
            {solutionData.additionalResources.length > 0 && (
              <div className="resources-list">
                {solutionData.additionalResources.map((resource, index) => (
                  <div key={index} className="resource-item">
                    <div className="resource-info">
                      <span className={`resource-type-badge ${resource.type}`}>
                        {resource.type}
                      </span>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        {resource.title}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(index)}
                      className="remove-resource-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publish Toggle */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={solutionData.isPublished}
                onChange={(e) => setSolutionData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="checkbox-input"
              />
              Publish solution immediately
            </label>
            <small className="form-hint">
              If unchecked, the solution will be saved as draft
            </small>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Saving...
                </>
              ) : (
                existingSolution ? 'Update Solution' : 'Save Solution'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolutionManagement;