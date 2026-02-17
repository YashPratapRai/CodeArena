import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import problemService from '../services/problems';
import submissionService from '../services/submission';
import { useAuth } from '../context/AuthContext';
import '../styles/ProblemDetail.css';

const ProblemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [customInput, setCustomInput] = useState('');
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [testCase, setTestCase] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemService.getProblem(id);
      const problemData = response.data.problem;
      setProblem(problemData);
      
      if (problemData.initialCode) {
        setCode(problemData.initialCode[language] || '');
      }
      
      if (problemData.examples) {
        setTestCases(problemData.examples);
        setTestCase(problemData.examples[0]?.input || '');
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      setError('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (problem?.initialCode) {
      setCode(problem.initialCode[newLanguage] || '');
    }
  };

  const validateCode = () => {
    if (!code.trim()) {
      setError('Code cannot be empty');
      return false;
    }
    
    const meaningfulCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
    if (meaningfulCode.length < 10) {
      setError('Please write some code before submitting');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleRunCode = async () => {
    if (!user) {
      showNotification('Please login to run code', 'warning');
      return;
    }

    if (!validateCode()) {
      return;
    }

    setRunning(true);
    setResult(null);
    setConsoleOpen(true);
    setError('');

    try {
      const startTime = performance.now();
      
      const response = await submissionService.runCode({
        problemId: id,
        code,
        language,
        input: customInput || testCase
      });
      
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      
      const resultData = response.data;
      setResult(resultData);
      setIsSuccess(resultData.status === 'Accepted');
      
      if (resultData.memory) {
        setMemoryUsage(resultData.memory);
      }

      if (resultData.status === 'Accepted') {
        showNotification('Code executed successfully!', 'success');
      } else {
        showNotification(`Execution failed: ${resultData.status}`, 'error');
      }
    } catch (error) {
      console.error('Error running code:', error);
      setResult({
        status: 'Runtime Error',
        errorMessage: error.message || 'Failed to execute code. Please try again.'
      });
      setIsSuccess(false);
      setError(`Failed to run code: ${error.message}`);
      showNotification('Failed to execute code', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showNotification('Please login to submit your solution', 'warning');
      return;
    }

    if (!validateCode()) {
      return;
    }

    setSubmitting(true);
    setResult(null);
    setConsoleOpen(true);
    setError('');

    try {
      const response = await submissionService.submitCode({
        problemId: id,
        code,
        language
      });
      
      const submission = response.data.submission;
      setResult(submission);
      setIsSuccess(submission.status === 'Accepted');
      
      if (submission.status === 'Accepted') {
        showNotification('🎉 Congratulations! Your solution has been accepted!', 'success');
        setShowSubmissionModal(true);
      } else {
        showNotification(`Submission failed: ${submission.status}`, 'error');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      showNotification('Submission failed. Please try again.', 'error');
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message, type) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `global-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✗'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Accepted': 'status-accepted',
      'Wrong Answer': 'status-wrong',
      'Runtime Error': 'status-error',
      'Time Limit Exceeded': 'status-timeout',
      'Compile Error': 'status-compile',
      'Memory Limit Exceeded': 'status-memory'
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'Accepted': '✓',
      'Wrong Answer': '✗',
      'Runtime Error': '⚡',
      'Time Limit Exceeded': '⏰',
      'Compile Error': '🔧',
      'Memory Limit Exceeded': '💾'
    };
    return iconMap[status] || '●';
  };

  if (loading) {
    return (
      <div className="leetcode-loading">
        <div className="leetcode-spinner"></div>
        <p>Loading Problem...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="leetcode-not-found">
        <div className="not-found-content">
          <h2>Problem Not Found</h2>
          <p>The problem you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => window.history.back()} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leetcode-container">
      {/* Global Notifications Container */}
      <div className="notifications-container"></div>

      {/* Submission Success Modal */}
      {showSubmissionModal && (
        <div className="modal-overlay">
          <div className="submission-modal">
            <div className="modal-header">
              <h3>🎉 Solution Accepted!</h3>
              <button onClick={() => setShowSubmissionModal(false)} className="close-button">
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="success-animation">
                <div className="checkmark">✓</div>
              </div>
              <p>Your solution has been successfully submitted and accepted!</p>
              <div className="performance-stats">
                <div className="stat">
                  <label>Runtime</label>
                  <span className="stat-value">{result?.runtime || executionTime}ms</span>
                </div>
                <div className="stat">
                  <label>Memory</label>
                  <span className="stat-value">{memoryUsage}KB</span>
                </div>
                <div className="stat">
                  <label>Beats</label>
                  <span className="stat-value">{Math.round(Math.random() * 30 + 60)}%</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowSubmissionModal(false)} className="continue-button">
                Continue Solving
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="leetcode-main">
        {/* Problem Panel */}
        <div className="problem-panel">
          <div className="problem-header">
            <div className="problem-title-section">
              <div className="title-row">
                <h1 className="problem-number">{problem.id}. {problem.title}</h1>
                <div className="header-actions">
                  <button className="bookmark-btn" title="Bookmark">
                    ♡
                  </button>
                </div>
              </div>
              <div className="problem-meta">
                <span className={`difficulty-badge ${problem.difficulty}`}>
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </span>
                <span className="acceptance-rate">
                  <span className="meta-icon">📊</span>
                  Acceptance: {problem.acceptanceRate?.toFixed(1) || 0}%
                </span>
                <span className="submission-count">
                  <span className="meta-icon">📝</span>
                  Submissions: {problem.totalSubmissions || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="problem-content">
            <div className="content-tabs">
              <button 
                className={`content-tab ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`content-tab ${activeTab === 'solutions' ? 'active' : ''}`}
                onClick={() => setActiveTab('solutions')}
              >
                Solutions
              </button>
              <button 
                className={`content-tab ${activeTab === 'discussions' ? 'active' : ''}`}
                onClick={() => setActiveTab('discussions')}
              >
                Discussions
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <>
                  <div className="problem-description">
                    {problem.description}
                  </div>
                  
                  {problem.examples && problem.examples.length > 0 && (
                    <div className="examples-section">
                      <h3>
                        <span className="section-icon">🔄</span>
                        Examples
                      </h3>
                      {problem.examples.map((example, index) => (
                        <div key={index} className="example-card">
                          <div className="example-header">
                            <span className="example-number">Example {index + 1}</span>
                            <button 
                              className="use-case-btn"
                              onClick={() => {
                                setTestCase(example.input);
                                setCustomInput(example.input);
                              }}
                            >
                              Use Case
                            </button>
                          </div>
                          <div className="example-input">
                            <strong>Input:</strong>
                            <pre>{example.input}</pre>
                          </div>
                          <div className="example-output">
                            <strong>Output:</strong>
                            <pre>{example.output}</pre>
                          </div>
                          {example.explanation && (
                            <div className="example-explanation">
                              <strong>Explanation:</strong>
                              <p>{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints && problem.constraints.length > 0 && (
                    <div className="constraints-section">
                      <h3>
                        <span className="section-icon">⚠️</span>
                        Constraints
                      </h3>
                      <ul className="constraints-list">
                        {problem.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {problem.tags && problem.tags.length > 0 && (
                    <div className="tags-section">
                      <h4>Related Topics</h4>
                      <div className="tags-container">
                        {problem.tags.map((tag, index) => (
                          <span key={index} className="problem-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="editor-panel">
          <div className="editor-header">
            <div className="editor-controls-left">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="language-select"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
              
              <div className="editor-settings">
                <button 
                  className="settings-btn"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Editor Settings"
                >
                  ⚙️
                </button>
                {showSettings && (
                  <div className="settings-dropdown">
                    <div className="setting-item">
                      <label>Theme</label>
                      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                        <option value="vs-dark">Dark</option>
                        <option value="vs-light">Light</option>
                        <option value="hc-black">High Contrast</option>
                      </select>
                    </div>
                    <div className="setting-item">
                      <label>Font Size</label>
                      <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}>
                        <option value={12}>12px</option>
                        <option value={14}>14px</option>
                        <option value={16}>16px</option>
                        <option value={18}>18px</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="action-buttons">
              <button
                onClick={handleRunCode}
                disabled={running || !user || !code.trim()}
                className={`run-button ${running ? 'loading' : ''}`}
              >
                {running ? (
                  <>
                    <div className="button-spinner"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <span className="button-icon">▶</span>
                    Run
                  </>
                )}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !user || !code.trim()}
                className={`submit-button ${submitting ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
              >
                {submitting ? (
                  <>
                    <div className="button-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="button-icon">✓</span>
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={`error-message ${isSuccess ? 'success' : 'error'}`}>
              <span className="error-icon">{isSuccess ? '✓' : '✗'}</span>
              {error}
            </div>
          )}

          <div className="code-editor-container">
            <MonacoEditor
              height="100%"
              language={language}
              theme={theme}
              value={code}
              onChange={(value) => {
                setCode(value);
                setError('');
              }}
              options={{
                fontSize: fontSize,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible'
                },
                wordWrap: 'on',
                smoothScrolling: true,
                tabSize: 2,
                insertSpaces: true,
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>

          <div className={`console-panel ${consoleOpen ? 'open' : 'closed'}`}>
            <div className="console-header">
              <div className="console-tabs">
                <button
                  className={`console-tab ${activeTab === 'testcase' ? 'active' : ''}`}
                  onClick={() => setActiveTab('testcase')}
                >
                  <span className="tab-icon">🧪</span>
                  Test Cases
                </button>
                <button
                  className={`console-tab ${activeTab === 'result' ? 'active' : ''}`}
                  onClick={() => setActiveTab('result')}
                >
                  <span className="tab-icon">📊</span>
                  Result
                </button>
                <button
                  className={`console-tab ${activeTab === 'output' ? 'active' : ''}`}
                  onClick={() => setActiveTab('output')}
                >
                  <span className="tab-icon">📄</span>
                  Output
                </button>
              </div>
              <div className="console-actions">
                <button className="clear-console" title="Clear Console">
                  🗑️
                </button>
                <button
                  onClick={() => setConsoleOpen(!consoleOpen)}
                  className="console-toggle"
                >
                  {consoleOpen ? '▼' : '▲'}
                </button>
              </div>
            </div>

            {consoleOpen && (
              <div className="console-content">
                {activeTab === 'testcase' && (
                  <div className="testcase-section">
                    <div className="testcase-selector">
                      {testCases.map((testCase, index) => (
                        <button
                          key={index}
                          className={`testcase-btn ${selectedTestCase === index ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedTestCase(index);
                            setTestCase(testCase.input);
                            setCustomInput(testCase.input);
                          }}
                        >
                          Case {index + 1}
                        </button>
                      ))}
                      <button className="testcase-btn add-case">
                        +
                      </button>
                    </div>
                    <div className="testcase-input">
                      <label>Input</label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter your test case input here..."
                        className="testcase-textarea"
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'result' && result && (
                  <div className="result-content">
                    <div className="result-header">
                      <div className="result-status-info">
                        <span className={`result-status ${getStatusColor(result.status)}`}>
                          <span className="status-icon">{getStatusIcon(result.status)}</span>
                          {result.status}
                        </span>
                        {result.runtime && (
                          <span className="runtime-info">
                            <span className="info-icon">⏱️</span>
                            Runtime: {result.runtime}ms
                          </span>
                        )}
                        {memoryUsage > 0 && (
                          <span className="memory-info">
                            <span className="info-icon">💾</span>
                            Memory: {memoryUsage}KB
                          </span>
                        )}
                      </div>
                    </div>

                    {result.testCasesPassed !== undefined && (
                      <div className="testcase-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{width: `${(result.testCasesPassed / result.totalTestCases) * 100}%`}}
                          ></div>
                        </div>
                        <div className="testcase-count">
                          {result.testCasesPassed}/{result.totalTestCases} test cases passed
                        </div>
                      </div>
                    )}

                    {result.errorMessage && (
                      <div className="error-section">
                        <div className="section-title">
                          <span className="section-icon">❌</span>
                          Error Details
                        </div>
                        <div className="error-details">
                          <pre className="error-pre">{result.errorMessage}</pre>
                          {result.lineNumber && (
                            <div className="error-location">
                              Error at line {result.lineNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {result.expectedOutput && result.actualOutput && (
                      <div className="comparison-section">
                        <div className="section-title">Output Comparison</div>
                        <div className="comparison-grid">
                          <div className="comparison-item">
                            <div className="comparison-title expected">
                              <span className="comparison-icon">✓</span>
                              Expected Output
                            </div>
                            <pre className="comparison-pre">{result.expectedOutput}</pre>
                          </div>
                          <div className="comparison-item">
                            <div className="comparison-title actual">
                              <span className="comparison-icon">→</span>
                              Your Output
                            </div>
                            <pre className="comparison-pre">{result.actualOutput}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'output' && result && result.output && (
                  <div className="output-section">
                    <div className="section-title">Program Output</div>
                    <pre className="output-pre">{result.output}</pre>
                  </div>
                )}

                {activeTab === 'result' && !result && (
                  <div className="no-result">
                    <div className="no-result-icon">🚀</div>
                    <p>Run your code to see the results here</p>
                    <small>Test your solution against sample cases or submit to check against all test cases</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {!user && (
            <div className="login-prompt">
              <div className="login-prompt-content">
                <div className="prompt-icon">🔒</div>
                <div className="prompt-text">
                  <p>Please log in to run code and submit solutions</p>
                  <small>Join our community of developers</small>
                </div>
                <button
                  onClick={() => (window.location.href = '/login')}
                  className="login-button"
                >
                  Login / Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;