import api from './api';

const solutionService = {
  // Get solutions for a problem
  getSolutionsByProblem: (problemId, params = {}) => {
    return api.get(`/solutions/problem/${problemId}`, { params });
  },

  // Get single solution
  getSolution: (id) => {
    return api.get(`/solutions/${id}`);
  },

  // Create solution
  createSolution: (solutionData) => {
    return api.post('/solutions', solutionData);
  },

  // Update solution
  updateSolution: (id, solutionData) => {
    return api.put(`/solutions/${id}`, solutionData);
  },

  // Delete solution
  deleteSolution: (id) => {
    return api.delete(`/solutions/${id}`);
  },

  // Upvote solution
  upvoteSolution: (id) => {
    return api.post(`/solutions/${id}/upvote`);
  },

  // Downvote solution
  downvoteSolution: (id) => {
    return api.post(`/solutions/${id}/downvote`);
  },

  // Get user solutions
  getUserSolutions: (userId, params = {}) => {
    return api.get(`/solutions/user/${userId}`, { params });
  }
};

export default solutionService;