import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Include credentials for CORS requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// This will be set by the auth hook
let getToken = null;

// Function to set the token getter (called from LearningContext)
export const setTokenGetter = (tokenGetter) => {
  getToken = tokenGetter;
};

// Add request interceptor to include Clerk auth token
api.interceptors.request.use(
  async (config) => {
    if (getToken) {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Return the full response data to maintain the backend's response structure
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Handle rate limiting
      console.error('Rate limit exceeded. Please wait before making more requests.');
      const retryAfter = error.response?.headers['retry-after'];
      if (retryAfter) {
        console.log(`Rate limit will reset in ${retryAfter} seconds`);
      }
      
      // Return a more user-friendly error
      return Promise.reject({
        message: 'Too many requests. Please wait a moment and try again.',
        status: 429,
        retryAfter: retryAfter ? parseInt(retryAfter) : 60
      });
    }
    
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API calls
export const authAPI = {
  getProfile: async () => {
    return api.get('/auth/profile');
  },
  
  updateProfile: async (data) => {
    return api.put('/auth/profile', data);
  },
  
  deleteProfile: async () => {
    return api.delete('/auth/profile');
  },

  // Username management
  checkUsername: async (username) => {
    return api.get(`/auth/check-username/${username}`);
  },

  setUsername: async (username) => {
    return api.post('/auth/set-username', { username });
  }
};

// Content API calls
export const contentAPI = {
  upload: async (formData, onProgress) => {
    return api.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      } : undefined,
    });
  },
  
  uploadText: async (data) => {
    return api.post('/content/text', data);
  },
  
  getAllContent: async (page = 1, limit = 10, category = '', search = '') => {
    return api.get('/content', {
      params: { page, limit, category, search }
    });
  },
  
  getContent: async (contentId) => {
    return api.get(`/content/${contentId}`);
  },
  
  updateContent: async (contentId, updates) => {
    return api.put(`/content/${contentId}`, updates);
  },
  
  deleteContent: async (contentId) => {
    return api.delete(`/content/${contentId}`);
  },
  
  searchContent: async (query, category, page = 1, limit = 10) => {
    return api.get('/content/search', {
      params: { q: query, category, page, limit }
    });
  },
  
  generateSummary: async (contentId, type = 'comprehensive') => {
    return api.post(`/content/${contentId}/summary`, { type });
  },
  
  updateProgress: async (contentId, progressData) => {
    return api.put(`/content/${contentId}/progress`, progressData);
  },
  
  getProgress: async (contentId) => {
    return api.get(`/content/${contentId}/progress`);
  },
  
  exportContent: async (contentId, format = 'pdf') => {
    return api.get(`/content/${contentId}/export/${format}`, {
      responseType: 'blob'
    });
  }
};

// Quiz API calls
export const quizAPI = {
  // Get all user quizzes
  getAllQuizzes: async (page = 1, limit = 10, status = 'all') => {
    return api.get(`/quiz/all?page=${page}&limit=${limit}&status=${status}`);
  },

  // Generate quiz from content
  generate: async (contentId, questionsPerSection = 3) => {
    return api.post('/quiz/generate', { 
      contentId, 
      questionsPerSection
    });
  },

  // Generate quiz from topic (custom quiz)
  generateFromTopic: async (topicData) => {
    return api.post('/quiz/generate-from-topic', topicData);
  },
  
  // Get quiz by content ID
  getByContentId: async (contentId) => {
    return api.get(`/quiz/content/${contentId}`);
  },
  
  // Start quiz attempt
  startAttempt: async (quizId) => {
    return api.post(`/quiz/${quizId}/attempt`);
  },
  
  // Submit quiz attempt
  submitAttempt: async (attemptId, answers) => {
    return api.post(`/quiz/attempt/${attemptId}/submit`, { answers });
  },
  
  // Get user's attempts for a content
  getAttempts: async (contentId) => {
    return api.get(`/quiz/content/${contentId}/attempts`);
  },
  
  // Get specific attempt details
  getAttempt: async (attemptId) => {
    return api.get(`/quiz/attempt/${attemptId}`);
  },

  // Get quiz results for dashboard
  getResults: async (contentId) => {
    return api.get(`/quiz/results/${contentId}`);
  },

  // Get quiz by quiz ID (for custom quizzes)
  getQuizById: async (quizId) => {
    return api.get(`/quiz/${quizId}`);
  },

  // Get quiz attempts by quiz ID
  getQuizAttempts: async (quizId) => {
    return api.get(`/quiz/${quizId}/attempts`);
  },

  // Legacy methods for backward compatibility
  getQuiz: async (quizId) => {
    return api.get(`/quiz/${quizId}`);
  },  submitQuiz: async (quizId, answers) => {
    return api.post(`/quiz/${quizId}/submit`, { answers });
  },
  
  getQuizHistory: async (contentId) => {
    return api.get(`/quiz/content/${contentId}/attempts`);
  }
};

// Analytics API calls
export const analyticsAPI = {
  getDashboard: async (timeframe = '30d') => {
    return api.get('/analytics/dashboard', {
      params: { timeframe }
    });
  },
  
  getProgress: async (timeframe = '30d') => {
    return api.get('/analytics/progress', {
      params: { timeframe }
    });
  },
  
  getPerformance: async (timeframe = '30d') => {
    return api.get('/analytics/performance', {
      params: { timeframe }
    });
  },
  
  getStudyTime: async (timeframe = '30d') => {
    return api.get('/analytics/study-time', {
      params: { timeframe }
    });
  },
  
  getContentAnalytics: async (contentId) => {
    return api.get(`/analytics/content/${contentId}`);
  },
  
  getQuizAnalytics: async (timeframe = '30d') => {
    return api.get('/analytics/quiz', {
      params: { timeframe }
    });
  },
  
  getLearningPath: async () => {
    return api.get('/analytics/learning-path');
  },
  
  getRecommendations: async () => {
    return api.get('/analytics/recommendations');
  },
  
  exportAnalytics: async (timeframe = '30d', format = 'json') => {
    return api.get('/analytics/export', {
      params: { timeframe, format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
  },

  getAllQuizAnalyses: async (page = 1, limit = 20) => {
    return api.get('/analytics/all-quiz-analyses', {
      params: { page, limit }
    });
  },

  getCommunityQuizAnalyses: async (page = 1, limit = 20) => {
    return api.get('/analytics/community-quiz-analyses', {
      params: { page, limit }
    });
  },

  debugQuizAttempts: async () => {
    return api.get('/analytics/debug-quiz-attempts');
  }
};

// Chatbot API
export const chatbotAPI = {
  // Chat with content context
  chatWithContent: async (contentId, message) => {
    return api.post(`/chatbot/chat/content/${contentId}`, { message });
  },
  
  // Chat with quiz context
  chatWithQuiz: async (quizId, message) => {
    return api.post(`/chatbot/chat/quiz/${quizId}`, { message });
  },
  
  // General chat
  chatGeneral: async (message) => {
    return api.post('/chatbot/chat/general', { message });
  }
};

// Helper function for retrying requests with exponential backoff
const retryRequest = async (requestFn, maxRetries = 2, baseDelay = 1000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      // Only retry on rate limit errors
      if (error.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// Community API calls
export const communityAPI = {
  // Community management
  getCommunities: async () => {
    return api.get('/community');
  },
  
  getAllCommunities: async () => {
    return api.get('/community');
  },
  
  getMyCommunities: async () => {
    return api.get('/community/my-communities');
  },
  
  joinCommunity: async (communityId) => {
    return api.post(`/community/${communityId}/join`);
  },
  
  leaveCommunity: async (communityId) => {
    return api.post(`/community/${communityId}/leave`);
  },
  
  getCommunityMembers: async (communityId, page = 1, limit = 20) => {
    return api.get(`/community/${communityId}/members`, {
      params: { page, limit }
    });
  },
  
  // Community content
  getCommunityContent: async (communityId, page = 1, limit = 10, category = '', search = '') => {
    return api.get(`/community-content/${communityId}`, {
      params: { page, limit, category, search }
    });
  },
  
  uploadCommunityContent: async (communityId, formData, onProgress) => {
    return api.post(`/community-content/${communityId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      } : undefined,
    });
  },
  
    shareCommunityContent: async (communityId, contentId, description = '') => {
    return api.post(`/community-content/${communityId}/share/${contentId}`, { description });
  },
  
  generateCommunityContentSummary: async (communityId, contentId) => {
    return api.post(`/community-content/${communityId}/${contentId}/generate-summary`);
  },
  
  // Community quizzes
  
  getCommunityContentById: async (communityId, contentId) => {
    return api.get(`/community-content/${communityId}/content/${contentId}`);
  },
  
  deleteCommunityContent: async (communityId, contentId) => {
    return api.delete(`/community-content/${communityId}/content/${contentId}`);
  },
  
  // Community quizzes
  getCommunityQuizzes: async (communityId, page = 1, limit = 10, type = 'public', difficulty = '', category = '') => {
    return api.get(`/community-quiz/${communityId}`, {
      params: { page, limit, type, difficulty, category }
    });
  },
  
  createQuizFromContent: async (communityId, contentId, config) => {
    return api.post(`/community-quiz/${communityId}/create-from-content/${contentId}`, config);
  },
  
  createCustomQuiz: async (communityId, config) => {
    return api.post(`/community-quiz/${communityId}/create-custom`, config);
  },
  
  joinPrivateQuiz: async (accessCode) => {
    return api.post('/community-quiz/join-private', { accessCode });
  },
  
  getCommunityQuizById: async (communityId, quizId) => {
    return api.get(`/community-quiz/${communityId}/quiz/${quizId}`);
  },
  
  getQuizLeaderboard: async (communityId, quizId) => {
    return api.get(`/community-quiz/${communityId}/quiz/${quizId}/leaderboard`);
  },
  
  getQuizDiscussion: async (communityId, quizId, page = 1, limit = 50) => {
    return api.get(`/community-quiz/${communityId}/quiz/${quizId}/discussion`, {
      params: { page, limit }
    });
  },
  
  sendQuizDiscussionMessage: async (communityId, quizId, content) => {
    return api.post(`/community-quiz/${communityId}/quiz/${quizId}/discussion`, { content });
  },

  // Community quiz attempts
  startCommunityQuizAttempt: async (communityId, quizId) => {
    return api.post(`/community-quiz/${communityId}/quiz/${quizId}/attempt`);
  },

  submitCommunityQuizAttempt: async (communityId, quizId, attemptId, answers, timeSpent) => {
    return api.post(`/community-quiz/${communityId}/quiz/${quizId}/attempt/${attemptId}/submit`, {
      answers,
      timeSpent
    });
  },

  // Get user's community quiz attempts
  getUserCommunityQuizAttempts: async (page = 1, limit = 10) => {
    return api.get(`/community-quiz/user/attempts?page=${page}&limit=${limit}`);
  },
  
  // Community chat
  getCommunityMessages: async (communityId, page = 1, limit = 50, type = 'general') => {
    return api.get(`/community-chat/${communityId}/messages`, {
      params: { page, limit, type }
    });
  },
  
  sendCommunityMessage: async (communityId, content, type = 'general', parentMessageId = null) => {
    return api.post(`/community-chat/${communityId}/messages`, {
      content,
      type,
      parentMessageId
    });
  },
  

  
  editMessage: async (communityId, messageId, content) => {
    return api.put(`/community-chat/${communityId}/messages/${messageId}`, { content });
  },
  
  deleteMessage: async (communityId, messageId) => {
    return api.delete(`/community-chat/${communityId}/messages/${messageId}`);
  },
  
  reactToMessage: async (communityId, messageId, emoji) => {
    return api.post(`/community-chat/${communityId}/messages/${messageId}/react`, { emoji });
  }
};

// Utility function to handle file upload progress
export const uploadWithProgress = (url, data, onProgress) => {
  return api.post(url, data, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    },
  });
};

// Health check
export const healthCheck = async () => {
  try {
    return api.get('/health');
  } catch (error) {
    throw new Error('Backend service is unavailable');
  }
};

// API Status check
export const getAPIStatus = async () => {
  try {
    return api.get('/api/status');
  } catch (error) {
    throw new Error('API status check failed');
  }
};

export default api;
