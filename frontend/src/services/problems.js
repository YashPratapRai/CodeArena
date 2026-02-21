import api from './api';

const problemService = {
  // Get all problems with optional filtering
  getProblems: (params = {}) => {
    const { page = 1, limit = 20, difficulty, tags, search } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    if (difficulty) queryParams.append('difficulty', difficulty);
    if (tags) queryParams.append('tags', tags);
    if (search) queryParams.append('search', search);

    return api.get(`/api/problems?${queryParams.toString()}`);
  },

  getProblem: (id) => api.get(`/api/problems/${id}`),
  
  createProblem: (problemData) => api.post('/api/problems', problemData),
  
  updateProblem: (id, problemData) => api.put(`/api/problems/${id}`, problemData),
  
  deleteProblem: (id) => api.delete(`/api/problems/${id}`),

  getStats: () => api.get('/api/problems/stats'),

  getProblemsByTag: (tag, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);

    return api.get(`/api/problems/tag/${tag}?${queryParams.toString()}`);
  },

  getRandomProblem: (difficulty) => {
    const params = difficulty ? `?difficulty=${difficulty}` : '';
    return api.get(`/api/problems/random${params}`);
  },

  // Get solution for a problem
  getSolution: async (problemId) => {
    const response = await api.get(`/api/problems/${problemId}/solution`); // Added /api/
    return response.data;
  },

  // Create or update solution
  saveSolution: async (problemId, solutionData) => {
    const response = await api.post(`/api/problems/${problemId}/solution`, solutionData); // Added /api/
    return response.data;
  },

  // Delete solution
  deleteSolution: async (problemId) => {
    const response = await api.delete(`/api/problems/${problemId}/solution`); // Added /api/
    return response.data;
  },

  // Toggle solution publish status
  toggleSolutionStatus: async (problemId) => {
    const response = await api.patch(`/api/problems/${problemId}/solution/toggle`); // Added /api/
    return response.data;
  }
};

export default problemService;