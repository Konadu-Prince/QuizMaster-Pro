const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  trackActivity,
  getUserActivitySummary,
  getPlatformAnalytics,
  getRealtimeAnalytics,
  getBehaviorInsights
} = require('../controllers/analyticsController');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');

const router = express.Router();

// Track user activity
router.post('/track', protect, trackActivity);

// Get user activity summary
router.get('/user/:userId/summary', protect, getUserActivitySummary);

// Get platform analytics (admin only)
router.get('/platform', protect, authorize('admin'), getPlatformAnalytics);

// Get real-time analytics (admin only)
router.get('/realtime', protect, authorize('admin'), getRealtimeAnalytics);

// Get behavior insights (admin only)
router.get('/insights', protect, authorize('admin'), getBehaviorInsights);

// @desc    Get user analytics dashboard
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get user's quiz attempts
    const attempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: startDate },
    }).populate('quiz', 'title category');

    // Get user's created quizzes
    const createdQuizzes = await Quiz.find({
      author: userId,
      createdAt: { $gte: startDate },
    });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === 'completed').length;
    const averageScore = attempts.length > 0 
      ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length 
      : 0;
    const averageTime = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length
      : 0;

    // Category breakdown
    const categoryStats = {};
    attempts.forEach(attempt => {
      const category = attempt.quiz.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { attempts: 0, totalScore: 0, count: 0 };
      }
      categoryStats[category].attempts++;
      categoryStats[category].totalScore += attempt.percentage;
      categoryStats[category].count++;
    });

    // Convert to array and calculate averages
    const categoryBreakdown = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      attempts: stats.attempts,
      averageScore: Math.round(stats.totalScore / stats.count),
    }));

    // Daily activity
    const dailyActivity = {};
    attempts.forEach(attempt => {
      const date = attempt.createdAt.toISOString().split('T')[0];
      if (!dailyActivity[date]) {
        dailyActivity[date] = 0;
      }
      dailyActivity[date]++;
    });

    const dailyActivityArray = Object.entries(dailyActivity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAttempts,
          completedAttempts,
          completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
          averageScore: Math.round(averageScore),
          averageTime: Math.round(averageTime),
          quizzesCreated: createdQuizzes.length,
        },
        categoryBreakdown,
        dailyActivity: dailyActivityArray,
        recentAttempts: attempts.slice(-5).map(attempt => ({
          id: attempt._id,
          quizTitle: attempt.quiz.title,
          score: attempt.percentage,
          timeSpent: attempt.timeSpent,
          status: attempt.status,
          createdAt: attempt.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analytics data',
    });
  }
});

// @desc    Get quiz performance analytics
// @route   GET /api/analytics/quiz/:id
// @access  Private
router.get('/quiz/:id', protect, async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user._id;

    // Check if user owns the quiz or has premium access
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const isOwner = quiz.author.toString() === userId.toString();
    const isPremium = req.user.subscription.type === 'premium' || req.user.subscription.type === 'enterprise';

    if (!isOwner && !isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required for detailed quiz analytics',
        upgradeRequired: true,
      });
    }

    // Get all attempts for this quiz
    const attempts = await QuizAttempt.find({ quiz: quizId })
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === 'completed').length;
    const averageScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
      : 0;
    const averageTime = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length
      : 0;
    const passRate = attempts.length > 0
      ? (attempts.filter(a => a.passed).length / attempts.length) * 100
      : 0;

    // Question analysis
    const questionStats = {};
    attempts.forEach(attempt => {
      attempt.answers.forEach(answer => {
        const questionId = answer.questionId.toString();
        if (!questionStats[questionId]) {
          questionStats[questionId] = {
            totalAttempts: 0,
            correctAnswers: 0,
            averageTime: 0,
            totalTime: 0,
          };
        }
        questionStats[questionId].totalAttempts++;
        questionStats[questionId].totalTime += answer.timeSpent;
        if (answer.isCorrect) {
          questionStats[questionId].correctAnswers++;
        }
      });
    });

    // Convert to array and calculate averages
    const questionAnalysis = Object.entries(questionStats).map(([questionId, stats]) => ({
      questionId,
      totalAttempts: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      accuracy: Math.round((stats.correctAnswers / stats.totalAttempts) * 100),
      averageTime: Math.round(stats.totalTime / stats.totalAttempts),
    }));

    // Time distribution
    const timeRanges = {
      '0-30s': 0,
      '30s-1m': 0,
      '1-2m': 0,
      '2-5m': 0,
      '5m+': 0,
    };

    attempts.forEach(attempt => {
      const timeInSeconds = attempt.timeSpent;
      if (timeInSeconds <= 30) timeRanges['0-30s']++;
      else if (timeInSeconds <= 60) timeRanges['30s-1m']++;
      else if (timeInSeconds <= 120) timeRanges['1-2m']++;
      else if (timeInSeconds <= 300) timeRanges['2-5m']++;
      else timeRanges['5m+']++;
    });

    // Score distribution
    const scoreRanges = {
      '0-20%': 0,
      '20-40%': 0,
      '40-60%': 0,
      '60-80%': 0,
      '80-100%': 0,
    };

    attempts.forEach(attempt => {
      const score = attempt.percentage;
      if (score <= 20) scoreRanges['0-20%']++;
      else if (score <= 40) scoreRanges['20-40%']++;
      else if (score <= 60) scoreRanges['40-60%']++;
      else if (score <= 80) scoreRanges['60-80%']++;
      else scoreRanges['80-100%']++;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAttempts,
          completedAttempts,
          completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
          averageScore: Math.round(averageScore),
          averageTime: Math.round(averageTime),
          passRate: Math.round(passRate),
        },
        questionAnalysis,
        timeDistribution: timeRanges,
        scoreDistribution: scoreRanges,
        recentAttempts: attempts.slice(0, 10).map(attempt => ({
          id: attempt._id,
          user: {
            username: attempt.user.username,
            name: `${attempt.user.firstName} ${attempt.user.lastName}`,
          },
          score: attempt.percentage,
          timeSpent: attempt.timeSpent,
          status: attempt.status,
          createdAt: attempt.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Quiz analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quiz analytics',
    });
  }
});

// @desc    Get leaderboard data
// @route   GET /api/analytics/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { category, period = 'all' } = req.query;

    // Calculate date range
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Build match criteria
    const matchCriteria = { status: 'completed', ...dateFilter };
    
    // Add category filter if specified
    if (category) {
      const quizzes = await Quiz.find({ category }).select('_id');
      const quizIds = quizzes.map(q => q._id);
      matchCriteria.quiz = { $in: quizIds };
    }

    // Aggregate leaderboard data
    const leaderboard = await QuizAttempt.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          totalTime: { $sum: '$timeSpent' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          avatar: '$user.avatar',
          totalScore: 1,
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 2] },
          totalTime: 1,
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 100 },
    ]);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaderboard data',
    });
  }
});

// @desc    Get platform statistics (admin only)
// @route   GET /api/analytics/platform
// @access  Private (Admin)
router.get('/platform', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { period = '30d' } = req.query;
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get platform statistics
    const [
      totalUsers,
      newUsers,
      totalQuizzes,
      newQuizzes,
      totalAttempts,
      newAttempts,
      premiumUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Quiz.countDocuments(),
      Quiz.countDocuments({ createdAt: { $gte: startDate } }),
      QuizAttempt.countDocuments(),
      QuizAttempt.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ 'subscription.type': { $in: ['premium', 'enterprise'] } }),
    ]);

    // Revenue calculation (simplified)
    const revenue = premiumUsers * 9.99; // Monthly revenue estimate

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          new: newUsers,
          premium: premiumUsers,
          premiumPercentage: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0,
        },
        quizzes: {
          total: totalQuizzes,
          new: newQuizzes,
        },
        attempts: {
          total: totalAttempts,
          new: newAttempts,
        },
        revenue: {
          monthly: revenue,
          annual: revenue * 12,
        },
      },
    });
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving platform analytics',
    });
  }
});

module.exports = router;
