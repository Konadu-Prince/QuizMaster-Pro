const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');

// @desc    Start a quiz attempt
// @route   POST /api/quiz-attempts/start
// @access  Private
const startQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.body;

    // Check if quiz exists and is published
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or not published'
      });
    }

    // Check if user already has an in-progress attempt
    const existingAttempt = await QuizAttempt.findOne({
      quiz: quizId,
      user: req.user.id,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        data: existingAttempt
      });
    }

    // Create new attempt
    const attempt = await QuizAttempt.create({
      quiz: quizId,
      user: req.user.id,
      startTime: new Date()
    });

    // Populate quiz data
    await attempt.populate('quiz', 'title description questions settings');

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an answer
// @route   POST /api/quiz-attempts/:id/answer
// @access  Private
const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedAnswer, timeSpent } = req.body;

    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check if user owns this attempt
    if (attempt.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if attempt is still in progress
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Quiz attempt is not in progress'
      });
    }

    // Get quiz to check correct answer
    const quiz = await Quiz.findById(attempt.quiz);
    const question = quiz.questions.id(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer is correct
    let isCorrect = false;
    let pointsEarned = 0;

    if (question.type === 'multiple-choice') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.text === selectedAnswer;
    } else if (question.type === 'true-false') {
      isCorrect = question.correctAnswer === selectedAnswer;
    } else if (question.type === 'fill-in-blank') {
      isCorrect = question.correctAnswer.toLowerCase() === selectedAnswer.toLowerCase();
    }

    if (isCorrect) {
      pointsEarned = question.points;
    }

    // Remove existing answer for this question if any
    attempt.answers = attempt.answers.filter(
      answer => answer.questionId.toString() !== questionId
    );

    // Add new answer
    attempt.answers.push({
      questionId,
      selectedAnswer,
      isCorrect,
      pointsEarned,
      timeSpent: timeSpent || 0
    });

    await attempt.save();

    res.json({
      success: true,
      data: {
        isCorrect,
        pointsEarned,
        explanation: question.explanation
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete quiz attempt
// @route   POST /api/quiz-attempts/:id/complete
// @access  Private
const completeQuiz = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check if user owns this attempt
    if (attempt.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if attempt is still in progress
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Quiz attempt is not in progress'
      });
    }

    // Get quiz to check pass percentage
    const quiz = await Quiz.findById(attempt.quiz);
    
    // Calculate total time spent
    const totalTimeSpent = attempt.answers.reduce((total, answer) => total + answer.timeSpent, 0);
    attempt.timeSpent = totalTimeSpent;

    // Check if passed
    attempt.isPassed = attempt.percentage >= quiz.settings.passPercentage;
    attempt.status = 'completed';
    attempt.endTime = new Date();

    await attempt.save();

    // Update quiz stats
    await updateQuizStats(quiz._id);

    // Update user stats
    await updateUserStats(req.user.id);

    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my quiz attempts
// @route   GET /api/quiz-attempts/my-attempts
// @access  Private
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate('quiz', 'title category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz attempt
// @route   GET /api/quiz-attempts/:id
// @access  Private
const getQuizAttempt = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('quiz', 'title questions settings')
      .populate('user', 'name');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check if user owns this attempt or is admin
    if (attempt.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz results (for quiz creators)
// @route   GET /api/quiz-attempts/quiz/:quizId/results
// @access  Private
const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is quiz creator or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view these results'
      });
    }

    const attempts = await QuizAttempt.find({ quiz: req.params.quizId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update quiz stats
const updateQuizStats = async (quizId) => {
  const stats = await QuizAttempt.aggregate([
    { $match: { quiz: quizId, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averageTime: { $avg: '$timeSpent' },
        completionRate: { $avg: { $cond: ['$isPassed', 1, 0] } }
      }
    }
  ]);

  if (stats.length > 0) {
    await Quiz.findByIdAndUpdate(quizId, {
      'stats.totalAttempts': stats[0].totalAttempts,
      'stats.averageScore': Math.round(stats[0].averageScore || 0),
      'stats.averageTime': Math.round(stats[0].averageTime || 0),
      'stats.completionRate': Math.round((stats[0].completionRate || 0) * 100)
    });
  }
};

// Helper function to update user stats
const updateUserStats = async (userId) => {
  const stats = await QuizAttempt.aggregate([
    { $match: { user: userId, status: 'completed' } },
    {
      $group: {
        _id: null,
        quizzesTaken: { $sum: 1 },
        totalScore: { $sum: '$score' },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      'stats.quizzesTaken': stats[0].quizzesTaken,
      'stats.totalScore': stats[0].totalScore,
      'stats.averageScore': Math.round(stats[0].averageScore || 0),
      'stats.lastQuizDate': new Date()
    });
  }
};

module.exports = {
  startQuiz,
  submitAnswer,
  completeQuiz,
  getMyAttempts,
  getQuizAttempt,
  getQuizResults
};