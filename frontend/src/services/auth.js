import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export const problemService = {
  getProblems: (params) => api.get('/problems', { params }),
  getProblem: (id) => api.get(`/problems/${id}`),
  createProblem: (data) => api.post('/problems', data),
  updateProblem: (id, data) => api.put(`/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/problems/${id}`),
};

export const submissionService = {
  submitCode: (data) => api.post('/submissions', data),
  getSubmissions: (params) => api.get('/submissions', { params }),
  getSubmission: (id) => api.get(`/submissions/${id}`),
};

export const userService = {
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
};