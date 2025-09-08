const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      avatar: req.body.avatar,
      preferences: req.body.preferences
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get quiz creation stats
    const quizStats = await Quiz.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          publishedQuizzes: { $sum: { $cond: ['$isPublished', 1, 0] } },
          totalQuestions: { $sum: { $size: '$questions' } }
        }
      }
    ]);

    // Get quiz attempt stats
    const attemptStats = await QuizAttempt.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          passedAttempts: { $sum: { $cond: ['$isPassed', 1, 0] } },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      }
    ]);

    // Get recent activity
    const recentAttempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title category')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      quizzes: quizStats[0] || {
        totalQuizzes: 0,
        publishedQuizzes: 0,
        totalQuestions: 0
      },
      attempts: attemptStats[0] || {
        totalAttempts: 0,
        passedAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        totalTimeSpent: 0
      },
      recentActivity: recentAttempts
    };

    // Calculate pass rate
    if (stats.attempts.totalAttempts > 0) {
      stats.attempts.passRate = Math.round(
        (stats.attempts.passedAttempts / stats.attempts.totalAttempts) * 100
      );
    } else {
      stats.attempts.passRate = 0;
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats
};