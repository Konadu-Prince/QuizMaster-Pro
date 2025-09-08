const UserActivity = require('../models/UserActivity');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

// @desc    Track user activity
// @route   POST /api/analytics/track
// @access  Private
const trackActivity = async (req, res) => {
  try {
    const activityData = {
      user: req.user._id,
      sessionId: req.body.sessionId || req.sessionID,
      activity: {
        type: req.body.type,
        category: req.body.category,
        action: req.body.action,
        description: req.body.description,
      },
      metadata: {
        ...req.body.metadata,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      },
      ip: req.ip,
    };

    const activity = await UserActivity.create(activityData);
    
    logger.logBusiness('User Activity Tracked', {
      userId: req.user._id,
      activityType: req.body.type,
      action: req.body.action,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error('Activity tracking error', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking activity',
    });
  }
};

// @desc    Get user activity summary
// @route   GET /api/analytics/user/:userId/summary
// @access  Private (Admin or own data)
const getUserActivitySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const summary = await UserActivity.getUserActivitySummary(userId, parseInt(days));
    
    res.json({
      success: true,
      data: {
        userId,
        period: `${days} days`,
        summary,
      },
    });
  } catch (error) {
    logger.error('User activity summary error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity summary',
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/analytics/platform
// @access  Private (Admin only)
const getPlatformAnalytics = async (req, res) => {
  try {
    const { days = 30, period = 'daily' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get engagement metrics
    const engagementMetrics = await UserActivity.getEngagementMetrics(parseInt(days));
    
    // Get popular quizzes
    const popularQuizzes = await UserActivity.getPopularQuizzes(parseInt(days), 10);
    
    // Get user growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get subscription analytics
    const subscriptionAnalytics = await Subscription.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Get quiz performance metrics
    const quizMetrics = await Quiz.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          publishedQuizzes: {
            $sum: {
              $cond: [{ $eq: ['$isPublished', true] }, 1, 0],
            },
          },
          avgQuestions: { $avg: { $size: '$questions' } },
        },
      },
    ]);

    // Get quiz attempt analytics
    const attemptMetrics = await QuizAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          completedAttempts: {
            $sum: {
              $cond: [{ $ne: ['$completedAt', null] }, 1, 0],
            },
          },
          avgScore: { $avg: '$score' },
          avgTimeSpent: { $avg: '$timeSpent' },
        },
      },
    ]);

    const analytics = {
      period: `${days} days`,
      engagement: engagementMetrics,
      popularQuizzes,
      userGrowth,
      subscriptions: subscriptionAnalytics,
      quizzes: quizMetrics[0] || {},
      attempts: attemptMetrics[0] || {},
      generatedAt: new Date(),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Platform analytics error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform analytics',
    });
  }
};

// @desc    Get real-time analytics
// @route   GET /api/analytics/realtime
// @access  Private (Admin only)
const getRealtimeAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Active users in last hour
    const activeUsersLastHour = await UserActivity.distinct('user', {
      timestamp: { $gte: lastHour },
      isActive: true,
    });

    // Active users in last 24 hours
    const activeUsersLast24Hours = await UserActivity.distinct('user', {
      timestamp: { $gte: last24Hours },
      isActive: true,
    });

    // Current online users (active in last 5 minutes)
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    const onlineUsers = await UserActivity.distinct('user', {
      timestamp: { $gte: last5Minutes },
      isActive: true,
    });

    // Recent activities
    const recentActivities = await UserActivity.find({
      timestamp: { $gte: lastHour },
      isActive: true,
    })
      .populate('user', 'username email')
      .populate('metadata.quizId', 'title')
      .sort({ timestamp: -1 })
      .limit(20)
      .select('activity metadata timestamp user');

    // Quiz activity in last hour
    const quizActivity = await UserActivity.aggregate([
      {
        $match: {
          'activity.type': { $in: ['quiz_start', 'quiz_complete'] },
          timestamp: { $gte: lastHour },
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$activity.type',
          count: { $sum: 1 },
        },
      },
    ]);

    const realtimeData = {
      timestamp: now,
      metrics: {
        onlineUsers: onlineUsers.length,
        activeUsersLastHour: activeUsersLastHour.length,
        activeUsersLast24Hours: activeUsersLast24Hours.length,
        quizActivity: quizActivity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      recentActivities,
    };

    res.json({
      success: true,
      data: realtimeData,
    });
  } catch (error) {
    logger.error('Realtime analytics error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching realtime analytics',
    });
  }
};

// @desc    Get user behavior insights
// @route   GET /api/analytics/insights
// @access  Private (Admin only)
const getBehaviorInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // User retention analysis
    const retentionData = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$user',
          firstActivity: { $min: '$timestamp' },
          lastActivity: { $max: '$timestamp' },
          totalActivities: { $sum: 1 },
          uniqueDays: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } },
        },
      },
      {
        $addFields: {
          daysActive: { $size: '$uniqueDays' },
          retentionDays: {
            $divide: [
              { $subtract: ['$lastActivity', '$firstActivity'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          avgActivitiesPerUser: { $avg: '$totalActivities' },
          avgDaysActive: { $avg: '$daysActive' },
          avgRetentionDays: { $avg: '$retentionDays' },
          highlyActiveUsers: {
            $sum: {
              $cond: [{ $gte: ['$totalActivities', 50] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Popular content analysis
    const popularContent = await UserActivity.aggregate([
      {
        $match: {
          'activity.type': 'page_view',
          timestamp: { $gte: startDate },
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$metadata.page',
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
        },
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
        },
      },
      {
        $sort: { views: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Peak usage times
    const peakTimes = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          isActive: true,
        },
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const insights = {
      period: `${days} days`,
      retention: retentionData[0] || {},
      popularContent,
      peakTimes,
      generatedAt: new Date(),
    };

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error('Behavior insights error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching behavior insights',
    });
  }
};

module.exports = {
  trackActivity,
  getUserActivitySummary,
  getPlatformAnalytics,
  getRealtimeAnalytics,
  getBehaviorInsights,
};


