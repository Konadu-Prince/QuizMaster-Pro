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

const quizService = {
  getQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response;
  },

  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response;
  },

  submitQuiz: async (quizId, answers) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response;
  },

  getQuizResults: async (quizId, attemptId) => {
    const response = await api.get(`/quizzes/${quizId}/results/${attemptId}`);
    return response;
  },

  getUserQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes/my', { params });
    return response;
  },

  getQuizAttempts: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/attempts`);
    return response;
  },
};

export default quizService;
