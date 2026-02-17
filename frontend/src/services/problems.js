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
  }
};

export default problemService;
