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

const userService = {
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response;
  },

  updateUserProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response;
  },

  getUserDashboard: async (params = {}) => {
    const response = await api.get('/users/dashboard', { params });
    return response;
  },

  getUserAttempts: async (params = {}) => {
    const response = await api.get('/users/attempts', { params });
    return response;
  },

  getUserQuizzes: async (params = {}) => {
    const response = await api.get('/users/quizzes', { params });
    return response;
  },

  deleteUserAccount: async (password) => {
    const response = await api.delete('/users/account', { data: { password } });
    return response;
  },

  getPublicUserProfile: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response;
  },
};

export default userService;
