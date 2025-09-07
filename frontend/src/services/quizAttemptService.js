import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const quizAttemptService = {
  startQuizAttempt: async (quizId) => {
    const response = await api.post('/quiz-attempts/start', { quizId });
    return response;
  },

  submitAnswer: async (attemptId, questionId, selectedAnswer, timeSpent) => {
    const response = await api.post(`/quiz-attempts/${attemptId}/answer`, {
      questionId,
      selectedAnswer,
      timeSpent,
    });
    return response;
  },

  completeQuizAttempt: async (attemptId) => {
    const response = await api.post(`/quiz-attempts/${attemptId}/complete`);
    return response;
  },

  getQuizAttempt: async (attemptId) => {
    const response = await api.get(`/quiz-attempts/${attemptId}`);
    return response;
  },

  getUserQuizAttempts: async (params = {}) => {
    const response = await api.get('/quiz-attempts', { params });
    return response;
  },

  getQuizAttemptStats: async (params = {}) => {
    const response = await api.get('/quiz-attempts/stats', { params });
    return response;
  },
};

export default quizAttemptService;
