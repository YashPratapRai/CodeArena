import api from './api';

export const authService = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
};

export const problemService = {
  getProblems: (params) => api.get('/api/problems', { params }),
  getProblem: (id) => api.get(`/api/problems/${id}`),
  createProblem: (data) => api.post('/api/problems', data),
  updateProblem: (id, data) => api.put(`/api/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/api/problems/${id}`),
};

export const submissionService = {
  submitCode: (data) => api.post('/api/submissions', data),
  getSubmissions: (params) => api.get('/api/submissions', { params }),
  getSubmission: (id) => api.get(`/api/submissions/${id}`),
};

export const userService = {
  getProfile: (userId) => api.get(`/api/users/profile/${userId}`),
  getLeaderboard: (params) => api.get('/api/users/leaderboard', { params }),
};
