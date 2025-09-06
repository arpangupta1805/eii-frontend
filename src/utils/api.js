import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

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
    }
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
