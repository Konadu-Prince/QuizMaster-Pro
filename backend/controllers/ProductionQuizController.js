/**
 * Production Quiz Controller - Real implementation without mock data
 */

const QuizService = require('../services/QuizService');
const { protect, authorize } = require('../middleware/auth');
const { checkSubscriptionLimit } = require('../middleware/subscription');

class ProductionQuizController {
  constructor() {
    this.quizService = new QuizService();
  }

  // @desc    Get all published quizzes
  // @route   GET /api/quizzes
  // @access  Public
  getQuizzes = async (req, res, next) => {
    try {
      const {
        category,
        difficulty,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        difficulty,
        search,
        sortBy,
        sortOrder
      };

      const result = await this.quizService.getPublicQuizzes(options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Get user's quizzes
  // @route   GET /api/user-quizzes/my-quizzes
  // @access  Private
  getUserQuizzes = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        isPublished = null
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : null
      };

      const result = await this.quizService.getUserQuizzes(req.user._id, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Get single quiz
  // @route   GET /api/quizzes/:id
  // @access  Public/Private
  getQuiz = async (req, res, next) => {
    try {
      const quiz = await this.quizService.getQuizById(req.params.id, req.user?._id);

      // Increment view count for published quizzes
      if (quiz.isPublished) {
        await this.quizService.repository.incrementViews(quiz._id);
      }

      res.json({
        success: true,
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Create new quiz
  // @route   POST /api/quizzes
  // @access  Private
  createQuiz = async (req, res, next) => {
    try {
      const quiz = await this.quizService.createQuiz(req.user._id, req.body);

      res.status(201).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Update quiz
  // @route   PUT /api/quizzes/:id
  // @access  Private
  updateQuiz = async (req, res, next) => {
    try {
      const quiz = await this.quizService.updateQuiz(req.params.id, req.user._id, req.body);

      res.json({
        success: true,
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Delete quiz
  // @route   DELETE /api/quizzes/:id
  // @access  Private
  deleteQuiz = async (req, res, next) => {
    try {
      await this.quizService.deleteQuiz(req.params.id, req.user._id);

      res.json({
        success: true,
        message: 'Quiz deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Publish quiz
  // @route   PUT /api/quizzes/:id/publish
  // @access  Private
  publishQuiz = async (req, res, next) => {
    try {
      const quiz = await this.quizService.publishQuiz(req.params.id, req.user._id);

      res.json({
        success: true,
        data: quiz,
        message: 'Quiz published successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Get quiz statistics
  // @route   GET /api/quizzes/:id/stats
  // @access  Private
  getQuizStats = async (req, res, next) => {
    try {
      const stats = await this.quizService.getQuizStats(req.params.id, req.user._id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Get popular quizzes
  // @route   GET /api/quizzes/popular
  // @access  Public
  getPopularQuizzes = async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;
      const quizzes = await this.quizService.repository.getPopularQuizzes(parseInt(limit));

      res.json({
        success: true,
        data: quizzes
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Get recent quizzes
  // @route   GET /api/quizzes/recent
  // @access  Public
  getRecentQuizzes = async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;
      const quizzes = await this.quizService.repository.getRecentQuizzes(parseInt(limit));

      res.json({
        success: true,
        data: quizzes
      });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Search quizzes
  // @route   GET /api/quizzes/search
  // @access  Public
  searchQuizzes = async (req, res, next) => {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const result = await this.quizService.search(q, ['title', 'description', 'tags'], {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: ['author'],
        sort: { createdAt: -1 }
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ProductionQuizController();
