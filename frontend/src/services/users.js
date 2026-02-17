import api from './api';

const userService = {
  getProfile: (userId) => api.get(`/api/users/profile/${userId}`),
  getMyProfile: () => api.get('/api/users/me'),
  updateProfile: (profileData) => api.put('/api/users/profile', profileData),

  getLeaderboard: (params = {}) => {
    const { page = 1, limit = 20, sortBy = 'totalSolved' } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sortBy', sortBy);

    return api.get(`/api/users/leaderboard?${queryParams.toString()}`);
  },

  getSolvedProblems: (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);

    const url = userId
      ? `/api/users/${userId}/solved?${queryParams.toString()}`
      : `/api/users/solved?${queryParams.toString()}`;

    return api.get(url);
  },

  getAttemptedProblems: (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const url = userId
      ? `/api/users/${userId}/attempted?${queryParams.toString()}`
      : `/api/users/attempted?${queryParams.toString()}`;

    return api.get(url);
  },

  getActivity: (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);

    const url = userId
      ? `/api/users/${userId}/activity?${queryParams.toString()}`
      : `/api/users/activity?${queryParams.toString()}`;

    return api.get(url);
  },

  followUser: (userId) => api.post(`/api/users/${userId}/follow`),
  unfollowUser: (userId) => api.post(`/api/users/${userId}/unfollow`),
  getFollowers: (userId) => api.get(`/api/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/api/users/${userId}/following`),

  searchUsers: (query, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    return api.get(`/api/users/search?${queryParams.toString()}`);
  },

  getUserStats: (userId = null) => {
    const url = userId ? `/api/users/stats/${userId}` : '/api/users/stats';
    return api.get(url);
  },

  updatePreferences: (preferences) => api.put('/api/users/preferences', preferences),
};

export default userService;
