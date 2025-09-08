/**
 * User Service - Handle user-related API calls
 */

import api from './api';

const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update notification preferences
  updateNotifications: async (notificationSettings) => {
    try {
      const response = await api.put('/users/notifications', notificationSettings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update privacy settings
  updatePrivacy: async (privacySettings) => {
    try {
      const response = await api.put('/users/privacy', privacySettings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update appearance settings
  updateAppearance: async (appearanceSettings) => {
    try {
      const response = await api.put('/users/appearance', appearanceSettings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/users/account', { data: { password } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile picture
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user activity
  getUserActivity: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/users/activity?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;