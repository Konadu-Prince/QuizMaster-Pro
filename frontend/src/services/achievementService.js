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

const achievementService = {
  // Get all achievements
  getAchievements: async (params = {}) => {
    const response = await api.get('/achievements', { params });
    return response;
  },

  // Get user's achievements
  getMyAchievements: async (unlocked = false) => {
    const response = await api.get('/achievements/my-achievements', {
      params: { unlocked: unlocked.toString() }
    });
    return response;
  },

  // Get user's achievement progress
  getAchievementProgress: async () => {
    const response = await api.get('/achievements/progress');
    return response;
  },

  // Get leaderboard
  getLeaderboard: async (type = 'totalPoints', limit = 10) => {
    const response = await api.get('/achievements/leaderboard', {
      params: { type, limit }
    });
    return response;
  },

  // Get user's rank
  getUserRank: async (type = 'totalPoints') => {
    const response = await api.get('/achievements/rank', {
      params: { type }
    });
    return response;
  },

  // Check and unlock achievements
  checkAchievements: async (action, data) => {
    const response = await api.post('/achievements/check', { action, data });
    return response;
  },

  // Achievement categories
  getCategories: () => {
    return [
      { value: 'quiz_creation', label: 'Quiz Creation', icon: '📝' },
      { value: 'quiz_taking', label: 'Quiz Taking', icon: '🎯' },
      { value: 'streak', label: 'Streaks', icon: '🔥' },
      { value: 'social', label: 'Social', icon: '👥' },
      { value: 'milestone', label: 'Milestones', icon: '🏆' },
      { value: 'special', label: 'Special', icon: '⭐' }
    ];
  },

  // Achievement types
  getTypes: () => {
    return [
      { value: 'count', label: 'Count Based', icon: '🔢' },
      { value: 'streak', label: 'Streak Based', icon: '🔥' },
      { value: 'score', label: 'Score Based', icon: '🎯' },
      { value: 'time', label: 'Time Based', icon: '⏱️' },
      { value: 'social', label: 'Social Based', icon: '👥' },
      { value: 'custom', label: 'Custom', icon: '⭐' }
    ];
  },

  // Rarity levels
  getRarities: () => {
    return [
      { value: 'common', label: 'Common', color: '#6B7280', icon: '🥉' },
      { value: 'uncommon', label: 'Uncommon', color: '#10B981', icon: '🥈' },
      { value: 'rare', label: 'Rare', color: '#3B82F6', icon: '🥇' },
      { value: 'epic', label: 'Epic', color: '#8B5CF6', icon: '💎' },
      { value: 'legendary', label: 'Legendary', color: '#F59E0B', icon: '👑' }
    ];
  },

  // Get rarity info
  getRarityInfo: (rarity) => {
    const rarities = this.getRarities();
    return rarities.find(r => r.value === rarity) || rarities[0];
  },

  // Calculate level from experience
  calculateLevel: (experience) => {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  },

  // Calculate experience needed for next level
  getExperienceToNextLevel: (currentLevel, currentExp) => {
    const nextLevelExp = Math.pow(currentLevel, 2) * 100;
    return nextLevelExp - currentExp;
  },

  // Get level progress percentage
  getLevelProgress: (currentLevel, currentExp) => {
    const currentLevelExp = Math.pow(currentLevel - 1, 2) * 100;
    const nextLevelExp = Math.pow(currentLevel, 2) * 100;
    const progress = ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(100, Math.max(0, progress));
  },

  // Format points with commas
  formatPoints: (points) => {
    return points.toLocaleString();
  },

  // Format time duration
  formatDuration: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },

  // Get achievement progress percentage
  calculateAchievementProgress: (achievement, userStats) => {
    if (!achievement || !userStats) return 0;
    
    switch (achievement.type) {
      case 'count':
        if (achievement.category === 'quiz_creation') {
          return Math.min(100, (userStats.quizzesCreated / achievement.criteria.count) * 100);
        } else if (achievement.category === 'quiz_taking') {
          return Math.min(100, (userStats.quizzesTaken / achievement.criteria.count) * 100);
        }
        break;
      case 'streak':
        return Math.min(100, (userStats.currentStreak / achievement.criteria.streak) * 100);
      case 'score':
        return Math.min(100, (userStats.bestScore / achievement.criteria.score) * 100);
      case 'time':
        return Math.min(100, (achievement.criteria.timeLimit / userStats.totalTimeSpent) * 100);
      default:
        return 0;
    }
    
    return 0;
  }
};

export default achievementService;

