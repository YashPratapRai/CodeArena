import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/SolutionViewModal.css';

const SolutionViewModal = ({ problem, solution, onClose }) => {
  const extractYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYoutubeEmbedUrl = (url) => {
    const videoId = extractYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="solution-view-modal">
      <div className="solution-view-content">
        <div className="solution-view-header">
          <div className="header-info">
            <h2>Solution: {problem.title}</h2>
            <span className={`difficulty-badge ${problem.difficulty}`}>
              {problem.difficulty}
            </span>
          </div>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="solution-view-body">
          {/* Video Solution */}
          {solution.videoSolution?.url && (
            <div className="video-solution-section">
              <h3>
                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Explanation
              </h3>
              <div className="video-container">
                {solution.videoSolution.platform === 'youtube' ? (
                  <iframe
                    src={getYoutubeEmbedUrl(solution.videoSolution.url)}
                    title={solution.videoSolution.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls src={solution.videoSolution.url}>
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              {solution.videoSolution.duration && (
                <div className="video-meta">
                  <span className="video-duration">
                    ⏱️ Duration: {solution.videoSolution.duration}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Text Solution */}
          {solution.textSolution && (
            <div className="text-solution-section">
              <h3>
                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Written Explanation
              </h3>
              <div className="markdown-content">
                <ReactMarkdown>
                  {solution.textSolution}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Additional Resources */}
          {solution.additionalResources?.length > 0 && (
            <div className="resources-section">
              <h3>
                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Additional Resources
              </h3>
              <ul className="resources-list">
                {solution.additionalResources.map((resource, index) => (
                  <li key={index} className="resource-item">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      <span className={`resource-type ${resource.type}`}>
                        {resource.type}
                      </span>
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionViewModal;