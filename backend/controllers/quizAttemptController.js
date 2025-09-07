const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { validationResult } = require('express-validator');

// @desc    Start quiz attempt
// @route   POST /api/quiz-attempts/start
// @access  Private
const startQuizAttempt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quizId } = req.body;

    // Check if quiz exists and is published
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not available'
      });
    }

    // Check if user already has an active attempt
    const existingAttempt = await QuizAttempt.findOne({
      user: req.user._id,
      quiz: quizId,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active attempt for this quiz',
        data: existingAttempt
      });
    }

    // Create new quiz attempt
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quizId,
      status: 'in_progress',
      startTime: new Date(),
      answers: []
    });

    // Populate quiz data for the attempt
    await attempt.populate('quiz', 'title description timeLimit questions');

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting quiz attempt'
    });
  }
};

// @desc    Submit answer for a question
// @route   POST /api/quiz-attempts/:id/answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { questionId, selectedAnswer, timeSpent } = req.body;

    // Find the attempt
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('quiz', 'questions');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check if user owns this attempt
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this attempt'
      });
    }

    // Check if attempt is still in progress
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Quiz attempt is no longer active'
      });
    }

    // Find the question
    const question = attempt.quiz.questions.find(q => q._id.toString() === questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer already exists
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    const isCorrect = question.answers.find(a => a._id.toString() === selectedAnswer)?.correct || false;

    const answerData = {
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent: timeSpent || 0
    };

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      // Add new answer
      attempt.answers.push(answerData);
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      data: {
        answer: answerData,
        isCorrect
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting answer'
    });
  }
};

// @desc    Complete quiz attempt
// @route   POST /api/quiz-attempts/:id/complete
// @access  Private
const completeQuizAttempt = async (req, res) => {
  try {
    // Find the attempt
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('quiz', 'questions passPercentage');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check if user owns this attempt
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this attempt'
      });
    }

    // Check if attempt is still in progress
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Quiz attempt is already completed'
      });
    }

    // Calculate results
    const totalQuestions = attempt.quiz.questions.length;
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= (attempt.quiz.passPercentage || 70);

    // Calculate time spent
    const endTime = new Date();
    const timeSpent = Math.round((endTime - attempt.startTime) / 1000); // in seconds

    // Update attempt
    attempt.status = 'completed';
    attempt.endTime = endTime;
    attempt.timeSpent = timeSpent;
    attempt.score = correctAnswers;
    attempt.percentage = score;
    attempt.passed = passed;

    await attempt.save();

    // Populate user data for response
    await attempt.populate('user', 'username firstName lastName');

    res.status(200).json({
      success: true,
      data: {
        attempt,
        results: {
          totalQuestions,
          correctAnswers,
          score,
          passed,
          timeSpent,
          passPercentage: attempt.quiz.passPercentage || 70
        }
      }
    });
  } catch (error) {
    console.error('Complete quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing quiz attempt'
    });
  }
};

// @desc    Get quiz attempt details
// @route   GET /api/quiz-attempts/:id
// @access  Private
const getQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('quiz', 'title description questions')
      .populate('user', 'username firstName lastName');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check if user owns this attempt or is admin
    if (attempt.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attempt'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quiz attempt'
    });
  }
};

// @desc    Get user's quiz attempts
// @route   GET /api/quiz-attempts
// @access  Private
const getUserQuizAttempts = async (req, res) => {
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
    console.error('Get user quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quiz attempts'
    });
  }
};

// @desc    Get quiz attempt statistics
// @route   GET /api/quiz-attempts/stats
// @access  Private
const getQuizAttemptStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const stats = await QuizAttempt.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          completedAttempts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageScore: { $avg: '$percentage' },
          averageTime: { $avg: '$timeSpent' },
          passedAttempts: {
            $sum: { $cond: ['$passed', 1, 0] }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      averageTime: 0,
      passedAttempts: 0
    };

    // Calculate pass rate
    result.passRate = result.completedAttempts > 0 
      ? Math.round((result.passedAttempts / result.completedAttempts) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get quiz attempt stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving quiz attempt statistics'
    });
  }
};

module.exports = {
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  getQuizAttempt,
  getUserQuizAttempts,
  getQuizAttemptStats
};
