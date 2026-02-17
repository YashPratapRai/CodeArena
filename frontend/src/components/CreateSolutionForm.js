import React, { useState } from 'react';
import solutionService from '../services/solutions';
import { useAuth } from '../context/AuthContext';
import '../styles/CreateSolutionForm.css';

const CreateSolutionForm = ({ problemId, problemTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    approach: '',
    complexity: {
      time: '',
      space: ''
    },
    code: [
      {
        language: 'javascript',
        code: ''
      }
    ],
    explanation: '',
    examples: [{ input: '', output: '', explanation: '' }],
    tags: [],
    youtubeUrl: ''
  });
  const [newTag, setNewTag] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleComplexityChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      complexity: {
        ...prev.complexity,
        [name]: value
      }
    }));
  };

  const handleCodeChange = (language, value) => {
    setFormData(prev => {
      const codeIndex = prev.code.findIndex(c => c.language === language);
      if (codeIndex >= 0) {
        const updatedCode = [...prev.code];
        updatedCode[codeIndex] = { ...updatedCode[codeIndex], code: value };
        return { ...prev, code: updatedCode };
      } else {
        return {
          ...prev,
          code: [...prev.code, { language, code: value }]
        };
      }
    });
  };

  const addLanguage = () => {
    const newLanguage = prompt('Enter language (javascript, python, java, cpp, c):');
    if (newLanguage && ['javascript', 'python', 'java', 'cpp', 'c'].includes(newLanguage)) {
      if (!formData.code.find(c => c.language === newLanguage)) {
        setFormData(prev => ({
          ...prev,
          code: [...prev.code, { language: newLanguage, code: '' }]
        }));
        setActiveLanguage(newLanguage);
      } else {
        alert('This language is already added.');
      }
    } else if (newLanguage) {
      alert('Please enter a valid language: javascript, python, java, cpp, or c');
    }
  };

  const removeLanguage = (languageToRemove) => {
    if (formData.code.length <= 1) {
      alert('You must have at least one language.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      code: prev.code.filter(code => code.language !== languageToRemove)
    }));
    
    // Switch to another language if the active one is removed
    if (activeLanguage === languageToRemove) {
      setActiveLanguage(formData.code[0].language);
    }
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const updateExample = (index, field, value) => {
    setFormData(prev => {
      const updatedExamples = [...prev.examples];
      updatedExamples[index] = { ...updatedExamples[index], [field]: value };
      return { ...prev, examples: updatedExamples };
    });
  };

  const removeExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.approach.trim()) newErrors.approach = 'Approach is required';
    if (!formData.explanation.trim()) newErrors.explanation = 'Explanation is required';
    if (!formData.complexity.time.trim()) newErrors.timeComplexity = 'Time complexity is required';
    if (!formData.complexity.space.trim()) newErrors.spaceComplexity = 'Space complexity is required';

    // Code validation
    const hasEmptyCode = formData.code.some(code => !code.code.trim());
    if (hasEmptyCode) newErrors.code = 'All code fields must be filled';

    // YouTube URL validation (if provided)
    if (formData.youtubeUrl && !isValidYouTubeUrl(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'Please enter a valid YouTube URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to create a solution');
      return;
    }

    if (!validateForm()) {
      alert('Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);
    try {
      await solutionService.createSolution({
        problemId,
        ...formData
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating solution:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create solution';
      alert(errorMessage);
      
      // Handle specific backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setErrors(backendErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCode = () => {
    return formData.code.find(c => c.language === activeLanguage)?.code || '';
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="create-solution-modal">
        <div className="modal-header">
          <h2>Create Solution for: {problemTitle}</h2>
          <button 
            type="button" 
            className="close-btn" 
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="solution-form">
          <div className="form-group">
            <label htmlFor="title">Solution Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a descriptive title for your solution"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Brief Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Briefly describe your solution approach"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="approach">Detailed Approach *</label>
            <textarea
              id="approach"
              name="approach"
              value={formData.approach}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Explain your approach step by step..."
              className={errors.approach ? 'error' : ''}
            />
            {errors.approach && <span className="error-message">{errors.approach}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="explanation">Solution Explanation *</label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Provide detailed explanation of your solution..."
              className={errors.explanation ? 'error' : ''}
            />
            {errors.explanation && <span className="error-message">{errors.explanation}</span>}
          </div>

          <div className="complexity-section">
            <h4>Complexity Analysis *</h4>
            <div className="complexity-inputs">
              <div className="form-group">
                <label htmlFor="time">Time Complexity</label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  value={formData.complexity.time}
                  onChange={handleComplexityChange}
                  required
                  placeholder="e.g., O(n), O(n log n)"
                  className={errors.timeComplexity ? 'error' : ''}
                />
                {errors.timeComplexity && <span className="error-message">{errors.timeComplexity}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="space">Space Complexity</label>
                <input
                  type="text"
                  id="space"
                  name="space"
                  value={formData.complexity.space}
                  onChange={handleComplexityChange}
                  required
                  placeholder="e.g., O(1), O(n)"
                  className={errors.spaceComplexity ? 'error' : ''}
                />
                {errors.spaceComplexity && <span className="error-message">{errors.spaceComplexity}</span>}
              </div>
            </div>
          </div>

          <div className="code-section">
            <div className="code-header">
              <h4>Solution Code *</h4>
              <div className="code-actions">
                <button 
                  type="button" 
                  onClick={addLanguage} 
                  className="add-language-btn"
                  disabled={loading}
                >
                  + Add Language
                </button>
              </div>
            </div>
            
            <div className="language-tabs-container">
              <div className="language-tabs">
                {formData.code.map((code) => (
                  <div key={code.language} className="language-tab-wrapper">
                    <button
                      type="button"
                      className={`language-tab ${activeLanguage === code.language ? 'active' : ''}`}
                      onClick={() => setActiveLanguage(code.language)}
                    >
                      {code.language}
                    </button>
                    {formData.code.length > 1 && (
                      <button
                        type="button"
                        className="remove-language-btn"
                        onClick={() => removeLanguage(code.language)}
                        title={`Remove ${code.language}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="code-editor">
              <textarea
                value={getCurrentCode()}
                onChange={(e) => handleCodeChange(activeLanguage, e.target.value)}
                required
                rows="12"
                placeholder={`Enter your ${activeLanguage} solution code...`}
                className={`code-textarea ${errors.code ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.code && <span className="error-message">Please fill code for all languages</span>}
            </div>
          </div>

          <div className="examples-section">
            <div className="section-header">
              <h4>Examples</h4>
              <button 
                type="button" 
                onClick={addExample} 
                className="add-example-btn"
                disabled={loading}
              >
                + Add Example
              </button>
            </div>

            {formData.examples.map((example, index) => (
              <div key={index} className="example-card">
                <div className="example-header">
                  <h5>Example {index + 1}</h5>
                  {formData.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="remove-example-btn"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="example-inputs">
                  <div className="form-group">
                    <label>Input</label>
                    <textarea
                      value={example.input}
                      onChange={(e) => updateExample(index, 'input', e.target.value)}
                      rows="2"
                      placeholder="Input values..."
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Output</label>
                    <textarea
                      value={example.output}
                      onChange={(e) => updateExample(index, 'output', e.target.value)}
                      rows="2"
                      placeholder="Expected output..."
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Explanation</label>
                    <textarea
                      value={example.explanation}
                      onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                      rows="2"
                      placeholder="Explanation of the example..."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tags-section">
            <h4>Tags</h4>
            <div className="tags-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Enter a tag and press Add or Enter"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={addTag} 
                className="add-tag-btn"
                disabled={loading}
              >
                Add
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.tags.length === 0 && (
                <span className="no-tags">No tags added yet</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="youtubeUrl">YouTube Video URL (Optional)</label>
            <input
              type="url"
              id="youtubeUrl"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className={errors.youtubeUrl ? 'error' : ''}
              disabled={loading}
            />
            {errors.youtubeUrl && <span className="error-message">{errors.youtubeUrl}</span>}
            <small className="help-text">
              Paste the full YouTube URL for your solution video
            </small>
          </div>

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
              disabled={loading} 
              className="submit-btn"
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Creating Solution...
                </>
              ) : (
                'Create Solution'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSolutionForm;