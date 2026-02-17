import api from './api';

class DiscussionService {
  // Get all discussions with filters
  async getDiscussions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/discussions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching discussions:', error);
      throw this.handleError(error);
    }
  }

  // Get single discussion
  async getDiscussion(id) {
    try {
      const response = await api.get(`/discussions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching discussion:', error);
      throw this.handleError(error);
    }
  }

  // Create new discussion
  async createDiscussion(data) {
    try {
      // Validate required fields
      if (!data.problemTitle || !data.title || !data.content) {
        throw new Error('Problem title, discussion title, and content are required');
      }

      const discussionData = {
        title: data.title,
        content: data.content,
        problemTitle: data.problemTitle,
        tags: data.tags || []
      };

      console.log('Sending discussion data:', discussionData);

      const response = await api.post('/discussions', discussionData);
      return response.data;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw this.handleError(error);
    }
  }

  // Add comment to discussion - FIXED
  async addComment(discussionId, data) {
    try {
      const response = await api.post(`/discussions/${discussionId}/comments`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw this.handleError(error);
    }
  }

  // Vote on discussion
  async voteDiscussion(discussionId, voteType) {
    try {
      const response = await api.post(`/discussions/${discussionId}/vote`, { voteType });
      return response.data;
    } catch (error) {
      console.error('Error voting on discussion:', error);
      throw this.handleError(error);
    }
  }

  // Vote on comment - FIXED
  async voteComment(discussionId, commentId, data) {
    try {
      const response = await api.post(`/discussions/${discussionId}/comments/${commentId}/vote`, data);
      return response.data;
    } catch (error) {
      console.error('Error voting on comment:', error);
      throw this.handleError(error);
    }
  }

  // Mark comment as solution
  async markAsSolution(discussionId, commentId) {
    try {
      const response = await api.post(`/discussions/${discussionId}/comments/${commentId}/solution`);
      return response.data;
    } catch (error) {
      console.error('Error marking solution:', error);
      throw this.handleError(error);
    }
  }

  // Get popular tags
  async getTags() {
    try {
      const response = await api.get('/discussions/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw this.handleError(error);
    }
  }

  // Search problems
  async searchProblems(query) {
    try {
      const response = await api.get(`/discussions/problems/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching problems:', error);
      throw this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const serverMessage = error.response.data.message;
      console.error('Server error details:', error.response.data);
      return new Error(serverMessage || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new DiscussionService();