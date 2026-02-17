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

    return api.get(`/problems?${queryParams.toString()}`);
  },

  // Get single problem by ID
  getProblem: (id) => api.get(`/problems/${id}`),

  // Create new problem (admin only)
  createProblem: (problemData) => api.post('/problems', problemData),

  // Update problem (admin only)
  updateProblem: (id, problemData) => api.put(`/problems/${id}`, problemData),

  // Delete problem (admin only)
  deleteProblem: (id) => api.delete(`/problems/${id}`),

  // Get problem statistics
  getStats: () => api.get('/problems/stats'),

  // Get problems by tag
  getProblemsByTag: (tag, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);

    return api.get(`/problems/tag/${tag}?${queryParams.toString()}`);
  },

  // Get random problem
  getRandomProblem: (difficulty) => {
    const params = difficulty ? `?difficulty=${difficulty}` : '';
    return api.get(`/problems/random${params}`);
  }
};

export default problemService;