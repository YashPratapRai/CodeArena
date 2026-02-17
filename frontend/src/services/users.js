import api from './api';

const userService = {
  // Get user profile by ID
  getProfile: (userId) => api.get(`/users/profile/${userId}`),

  // Get current user's profile
  getMyProfile: () => api.get('/users/me'),

  // Update user profile
  updateProfile: (profileData) => api.put('/users/profile', profileData),

  // Get leaderboard
  getLeaderboard: (params = {}) => {
    const { page = 1, limit = 20, sortBy = 'totalSolved' } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sortBy', sortBy);

    return api.get(`/users/leaderboard?${queryParams.toString()}`);
  },

  // Get user's solved problems
  getSolvedProblems: (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);

    const url = userId 
      ? `/users/${userId}/solved?${queryParams.toString()}`
      : `/users/solved?${queryParams.toString()}`;
    
    return api.get(url);
  },

  // Get user's attempted problems
  getAttemptedProblems: (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const url = userId 
      ? `/users/${userId}/attempted?${queryParams.toString()}`
      : `/users/attempted?${queryParams.toString()}`;
    
    return api.get(url);
  },

  // Get user's activity history
  getActivity: (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);

    const url = userId 
      ? `/users/${userId}/activity?${queryParams.toString()}`
      : `/users/activity?${queryParams.toString()}`;
    
    return api.get(url);
  },

  // Follow/Unfollow user
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.post(`/users/${userId}/unfollow`),

  // Get user's followers and following
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),

  // Search users
  searchUsers: (query, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    return api.get(`/users/search?${queryParams.toString()}`);
  },

  // Get user statistics
  getUserStats: (userId = null) => {
    const url = userId ? `/users/stats/${userId}` : '/users/stats';
    return api.get(url);
  },

  // Update user preferences
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
};

export default userService;