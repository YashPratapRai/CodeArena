import api from './api';

const submissionService = {
  // Submit code for a problem
  submitCode: (submissionData) => api.post('/submissions', submissionData),

  // Run code without submission (NEW - ADD THIS)
  runCode: (runData) => api.post('/submissions/run', runData),

  // Get user's submissions with optional filtering
  getSubmissions: (params = {}) => {
    const { page = 1, limit = 10, problemId, status, language } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    if (problemId) queryParams.append('problemId', problemId);
    if (status) queryParams.append('status', status);
    if (language) queryParams.append('language', language);

    return api.get(`/submissions?${queryParams.toString()}`);
  },

  // Get single submission by ID
  getSubmission: (id) => api.get(`/submissions/${id}`),

  // Get user's submissions for a specific problem
  getProblemSubmissions: (problemId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);

    return api.get(`/submissions/problem/${problemId}?${queryParams.toString()}`);
  },

  // Get submission statistics for a user
  getSubmissionStats: (userId = null) => {
    const url = userId ? `/submissions/stats/${userId}` : '/submissions/stats';
    return api.get(url);
  },

  // Get recent submissions
  getRecentSubmissions: (limit = 10) => {
    return api.get(`/submissions/recent?limit=${limit}`);
  },

  // Re-run a submission (admin only)
  rerunSubmission: (id) => api.post(`/submissions/${id}/rerun`),
};

export default submissionService;