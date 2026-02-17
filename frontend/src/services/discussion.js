import api from './api';

class DiscussionService {
  async getDiscussions(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/api/discussions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching discussions:', error);
      throw this.handleError(error);
    }
  }

  async getDiscussion(id) {
    const response = await api.get(`/api/discussions/${id}`);
    return response.data;
  }

  async createDiscussion(data) {
    const response = await api.post('/api/discussions', data);
    return response.data;
  }

  async addComment(discussionId, data) {
    const response = await api.post(`/api/discussions/${discussionId}/comments`, data);
    return response.data;
  }

  async voteDiscussion(discussionId, voteType) {
    const response = await api.post(`/api/discussions/${discussionId}/vote`, { voteType });
    return response.data;
  }

  async voteComment(discussionId, commentId, data) {
    const response = await api.post(`/api/discussions/${discussionId}/comments/${commentId}/vote`, data);
    return response.data;
  }

  async markAsSolution(discussionId, commentId) {
    const response = await api.post(`/api/discussions/${discussionId}/comments/${commentId}/solution`);
    return response.data;
  }

  async getTags() {
    const response = await api.get('/api/discussions/tags');
    return response.data;
  }

  async searchProblems(query) {
    const response = await api.get(`/api/discussions/problems/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new DiscussionService();
