const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const [quizCount, attemptCount, avgScore] = await Promise.all([
      Quiz.countDocuments({ author: user._id }),
      QuizAttempt.countDocuments({ user: user._id, status: 'completed' }),
      QuizAttempt.aggregate([
        { $match: { user: user._id, status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
      ])
    ]);

    const userStats = {
      quizzesCreated: quizCount,
      quizzesAttempted: attemptCount,
      averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avgScore) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: userStats
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'username', 'bio', 'avatar'];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Check if username is being updated and if it's unique
    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get user's recent quizzes
    const recentQuizzes = await Quiz.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category difficulty isPublished createdAt');

    // Get user's recent attempts
    const recentAttempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title category')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('quiz percentage timeSpent status createdAt');

    // Get statistics
    const [totalQuizzes, totalAttempts, avgScore, recentActivity] = await Promise.all([
      Quiz.countDocuments({ author: userId }),
      QuizAttempt.countDocuments({ user: userId, status: 'completed' }),
      QuizAttempt.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
      ]),
      QuizAttempt.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const dashboardData = {
      stats: {
        totalQuizzes,
        totalAttempts,
        averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avgScore) : 0
      },
      recentQuizzes,
      recentAttempts,
      activity: recentActivity.map(item => ({
        date: item._id,
        attempts: item.count
      }))
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data'
    });
  }
};

// @desc    Get user's quiz attempts
// @route   GET /api/users/attempts
// @access  Private
const getUserAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 10, quizId, status } = req.query;

    const filter = { user: req.user._id };
    
    if (quizId) {
      filter.quiz = quizId;
    }
    
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attempts = await QuizAttempt.find(filter)
      .populate('quiz', 'title category difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await QuizAttempt.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        attempts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAttempts: total,
          hasNext: skip + attempts.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user attempts'
    });
  }
};

// @desc    Get user's created quizzes
// @route   GET /api/users/quizzes
// @access  Private
const getUserQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { author: req.user._id };
    if (status) {
      filter.isPublished = status === 'published';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments(filter);

    // Get attempt statistics for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const stats = await QuizAttempt.aggregate([
          { $match: { quiz: quiz._id } },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              averageScore: { $avg: '$percentage' },
              averageTime: { $avg: '$timeSpent' }
            }
          }
        ]);

        return {
          ...quiz.toObject(),
          stats: stats.length > 0 ? stats[0] : {
            totalAttempts: 0,
            averageScore: 0,
            averageTime: 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        quizzes: quizzesWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalQuizzes: total,
          hasNext: skip + quizzes.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user quizzes'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Verify password
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      Quiz.deleteMany({ author: req.user._id }),
      QuizAttempt.deleteMany({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

// @desc    Get public user profile
// @route   GET /api/users/:username
// @access  Public
const getPublicUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username firstName lastName bio avatar createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's public quizzes
    const publicQuizzes = await Quiz.find({
      author: user._id,
      isPublished: true
    })
      .select('title description category difficulty createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user statistics (only public data)
    const [totalQuizzes, totalAttempts] = await Promise.all([
      Quiz.countDocuments({ author: user._id, isPublished: true }),
      QuizAttempt.countDocuments({ user: user._id, status: 'completed' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        publicQuizzes,
        stats: {
          totalQuizzes,
          totalAttempts
        }
      }
    });
  } catch (error) {
    console.error('Get public user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  getUserAttempts,
  getUserQuizzes,
  deleteUserAccount,
  getPublicUserProfile
};
