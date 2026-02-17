import React, { useState, useEffect } from 'react';
import problemService from '../../services/problems';
// import '../../styles/ProblemForm.css';

const ProblemForm = ({ problem, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: [],
    constraints: [''],
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isPublic: false }],
    initialCode: {
      javascript: '',
      python: '',
      java: '',
      cpp: ''
    },
    hints: ['']
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title || '',
        description: problem.description || '',
        difficulty: problem.difficulty || 'easy',
        tags: problem.tags || [],
        constraints: problem.constraints?.length ? problem.constraints : [''],
        examples: problem.examples?.length ? problem.examples : [{ input: '', output: '', explanation: '' }],
        testCases: problem.testCases?.length ? problem.testCases : [{ input: '', expectedOutput: '', isPublic: false }],
        initialCode: problem.initialCode || {
          javascript: '',
          python: '',
          java: '',
          cpp: ''
        },
        hints: problem.hints?.length ? problem.hints : ['']
      });
    }
  }, [problem]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  const handleConstraintChange = (index, value) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = value;
    setFormData(prev => ({
      ...prev,
      constraints: newConstraints
    }));
  };

  const handleRemoveConstraint = (index) => {
    if (formData.constraints.length > 1) {
      setFormData(prev => ({
        ...prev,
        constraints: prev.constraints.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAddExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index] = {
      ...newExamples[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      examples: newExamples
    }));
  };

  const handleRemoveExample = (index) => {
    if (formData.examples.length > 1) {
      setFormData(prev => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAddTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isPublic: false }]
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      testCases: newTestCases
    }));
  };

  const handleRemoveTestCase = (index) => {
    if (formData.testCases.length > 1) {
      setFormData(prev => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAddHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const handleHintChange = (index, value) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData(prev => ({
      ...prev,
      hints: newHints
    }));
  };

  const handleRemoveHint = (index) => {
    if (formData.hints.length > 1) {
      setFormData(prev => ({
        ...prev,
        hints: prev.hints.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    if (formData.constraints.some(c => !c.trim())) {
      newErrors.constraints = 'All constraints must be filled';
    }
    if (formData.examples.some(e => !e.input.trim() || !e.output.trim())) {
      newErrors.examples = 'All examples must have input and output';
    }
    if (formData.testCases.some(t => !t.input.trim() || !t.expectedOutput.trim())) {
      newErrors.testCases = 'All test cases must have input and expected output';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Filter out empty values
      const submitData = {
        ...formData,
        constraints: formData.constraints.filter(c => c.trim()),
        examples: formData.examples.filter(e => e.input.trim() && e.output.trim()),
        testCases: formData.testCases.filter(t => t.input.trim() && t.expectedOutput.trim()),
        hints: formData.hints.filter(h => h.trim())
      };

      if (problem) {
        await problemService.updateProblem(problem._id, submitData);
      } else {
        await problemService.createProblem(submitData);
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving problem:', error);
      alert('Failed to save problem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="problem-form-container">
      <div className="problem-form-header">
        <h2>{problem ? 'Edit Problem' : 'Create New Problem'}</h2>
        <button onClick={onClose} className="close-button">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="problem-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Problem Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Enter problem title"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="difficulty" className="form-label">
              Difficulty *
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="form-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Problem Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe the problem in detail..."
              rows={6}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h3 className="section-title">Tags</h3>
          <div className="form-group">
            <label className="form-label">Problem Tags *</label>
            <div className="tags-input-container">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="form-input"
                placeholder="Enter a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="add-tag-button"
              >
                Add Tag
              </button>
            </div>
            {errors.tags && <span className="error-message">{errors.tags}</span>}
            
            <div className="tags-container">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div className="form-section">
          <h3 className="section-title">Constraints</h3>
          {formData.constraints.map((constraint, index) => (
            <div key={index} className="constraint-item">
              <input
                type="text"
                value={constraint}
                onChange={(e) => handleConstraintChange(index, e.target.value)}
                className={`form-input ${errors.constraints ? 'error' : ''}`}
                placeholder={`Constraint ${index + 1}`}
              />
              {formData.constraints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveConstraint(index)}
                  className="remove-item-button"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddConstraint}
            className="add-item-button"
          >
            Add Constraint
          </button>
        </div>

        {/* Examples */}
        <div className="form-section">
          <h3 className="section-title">Examples</h3>
          {formData.examples.map((example, index) => (
            <div key={index} className="example-item">
              <div className="example-header">
                <h4>Example {index + 1}</h4>
                {formData.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExample(index)}
                    className="remove-item-button"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Input</label>
                <textarea
                  value={example.input}
                  onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                  className={`form-textarea ${errors.examples ? 'error' : ''}`}
                  placeholder="Example input"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Output</label>
                <textarea
                  value={example.output}
                  onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                  className={`form-textarea ${errors.examples ? 'error' : ''}`}
                  placeholder="Example output"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Explanation (Optional)</label>
                <textarea
                  value={example.explanation}
                  onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                  className="form-textarea"
                  placeholder="Explanation of the example"
                  rows={2}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddExample}
            className="add-item-button"
          >
            Add Example
          </button>
        </div>

        {/* Test Cases */}
        <div className="form-section">
          <h3 className="section-title">Test Cases</h3>
          {formData.testCases.map((testCase, index) => (
            <div key={index} className="testcase-item">
              <div className="testcase-header">
                <h4>Test Case {index + 1}</h4>
                {formData.testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTestCase(index)}
                    className="remove-item-button"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Input</label>
                <textarea
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                  className={`form-textarea ${errors.testCases ? 'error' : ''}`}
                  placeholder="Test case input"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Output</label>
                <textarea
                  value={testCase.expectedOutput}
                  onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                  className={`form-textarea ${errors.testCases ? 'error' : ''}`}
                  placeholder="Expected output"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={testCase.isPublic}
                    onChange={(e) => handleTestCaseChange(index, 'isPublic', e.target.checked)}
                    className="checkbox-input"
                  />
                  Public Test Case (visible to users)
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTestCase}
            className="add-item-button"
          >
            Add Test Case
          </button>
        </div>

        {/* Initial Code */}
        <div className="form-section">
          <h3 className="section-title">Initial Code Templates</h3>
          
          {['javascript', 'python', 'java', 'cpp'].map((language) => (
            <div key={language} className="form-group">
              <label className="form-label">
                {language.charAt(0).toUpperCase() + language.slice(1)} Code
              </label>
              <textarea
                value={formData.initialCode[language]}
                onChange={(e) => handleNestedChange('initialCode', language, e.target.value)}
                className="form-textarea code-textarea"
                placeholder={`Initial ${language} code template`}
                rows={6}
              />
            </div>
          ))}
        </div>

        {/* Hints */}
        <div className="form-section">
          <h3 className="section-title">Hints</h3>
          {formData.hints.map((hint, index) => (
            <div key={index} className="hint-item">
              <textarea
                value={hint}
                onChange={(e) => handleHintChange(index, e.target.value)}
                className="form-textarea"
                placeholder={`Hint ${index + 1}`}
                rows={2}
              />
              {formData.hints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveHint(index)}
                  className="remove-item-button"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddHint}
            className="add-item-button"
          >
            Add Hint
          </button>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                {problem ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              problem ? 'Update Problem' : 'Create Problem'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProblemForm;