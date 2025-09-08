const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  activity: {
    type: {
      type: String,
      enum: [
        'page_view',
        'quiz_start',
        'quiz_complete',
        'quiz_abandon',
        'question_answer',
        'login',
        'logout',
        'register',
        'profile_update',
        'subscription_change',
        'achievement_unlock',
        'search',
        'filter',
        'share',
        'download',
        'api_call',
        'error',
        'custom'
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ['navigation', 'quiz', 'user', 'system', 'engagement', 'business'],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  metadata: {
    // Page/Route information
    page: String,
    route: String,
    referrer: String,
    
    // Quiz-specific data
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    score: Number,
    timeSpent: Number,
    
    // User agent and device info
    userAgent: String,
    device: String,
    browser: String,
    os: String,
    
    // Location data (if available)
    country: String,
    city: String,
    timezone: String,
    
    // Custom metadata
    customData: mongoose.Schema.Types.Mixed,
    
    // Performance metrics
    loadTime: Number,
    responseTime: Number,
    
    // Error information
    errorCode: String,
    errorMessage: String,
    stackTrace: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ip: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance
userActivitySchema.index({ user: 1, timestamp: -1 });
userActivitySchema.index({ 'activity.type': 1, timestamp: -1 });
userActivitySchema.index({ 'activity.category': 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });
userActivitySchema.index({ 'metadata.quizId': 1, timestamp: -1 });
userActivitySchema.index({ timestamp: -1 });

// Virtual for session duration
userActivitySchema.virtual('sessionDuration').get(function() {
  // This would be calculated based on session start/end activities
  return null;
});

// Static method to get user activity summary
userActivitySchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const activities = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$activity.type',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
        avgTimeSpent: { $avg: '$metadata.timeSpent' },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
  
  return activities;
};

// Static method to get popular quizzes
userActivitySchema.statics.getPopularQuizzes = async function(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const popularQuizzes = await this.aggregate([
    {
      $match: {
        'activity.type': { $in: ['quiz_start', 'quiz_complete'] },
        'metadata.quizId': { $exists: true },
        timestamp: { $gte: startDate },
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$metadata.quizId',
        starts: {
          $sum: {
            $cond: [{ $eq: ['$activity.type', 'quiz_start'] }, 1, 0],
          },
        },
        completions: {
          $sum: {
            $cond: [{ $eq: ['$activity.type', 'quiz_complete'] }, 1, 0],
          },
        },
        uniqueUsers: { $addToSet: '$user' },
        avgScore: { $avg: '$metadata.score' },
        avgTimeSpent: { $avg: '$metadata.timeSpent' },
      },
    },
    {
      $addFields: {
        completionRate: {
          $cond: [
            { $gt: ['$starts', 0] },
            { $divide: ['$completions', '$starts'] },
            0,
          ],
        },
        uniqueUserCount: { $size: '$uniqueUsers' },
      },
    },
    {
      $sort: { starts: -1 },
    },
    {
      $limit: limit,
    },
  ]);
  
  return popularQuizzes;
};

// Static method to get user engagement metrics
userActivitySchema.statics.getEngagementMetrics = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const metrics = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        uniqueSessions: { $addToSet: '$sessionId' },
        avgTimeSpent: { $avg: '$metadata.timeSpent' },
        quizStarts: {
          $sum: {
            $cond: [{ $eq: ['$activity.type', 'quiz_start'] }, 1, 0],
          },
        },
        quizCompletions: {
          $sum: {
            $cond: [{ $eq: ['$activity.type', 'quiz_complete'] }, 1, 0],
          },
        },
        pageViews: {
          $sum: {
            $cond: [{ $eq: ['$activity.type', 'page_view'] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' },
        uniqueSessionCount: { $size: '$uniqueSessions' },
        completionRate: {
          $cond: [
            { $gt: ['$quizStarts', 0] },
            { $divide: ['$quizCompletions', '$quizStarts'] },
            0,
          ],
        },
        avgActivitiesPerUser: {
          $cond: [
            { $gt: [{ $size: '$uniqueUsers' }, 0] },
            { $divide: ['$totalActivities', { $size: '$uniqueUsers' }] },
            0,
          ],
        },
      },
    },
  ]);
  
  return metrics[0] || {};
};

module.exports = mongoose.model('UserActivity', userActivitySchema);


