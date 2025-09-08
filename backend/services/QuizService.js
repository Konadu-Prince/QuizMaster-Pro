/**
 * Quiz Service - Real implementation without mock data
 */

const BaseService = require('./BaseService');
const QuizRepository = require('../repositories/QuizRepository');
const UserRepository = require('../repositories/UserRepository');
const SubscriptionRepository = require('../repositories/SubscriptionRepository');

class QuizService extends BaseService {
  constructor() {
    super(new QuizRepository());
    this.userRepository = new UserRepository();
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async createQuiz(userId, quizData) {
    try {
      // Check subscription limits
      const subscription = await this.subscriptionRepository.findOne({ user: userId });
      if (!subscription.canCreateQuiz()) {
        throw new Error('Quiz creation limit reached. Please upgrade your subscription.');
      }

      // Validate quiz data
      this.validateQuizData(quizData);

      // Create quiz
      const quiz = await this.create({
        ...quizData,
        author: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update subscription usage
      await subscription.updateUsage('quiz', 1);

      // Log audit
      await this.logAudit('CREATE_QUIZ', quiz._id, userId, {
        title: quiz.title,
        category: quiz.category
      });

      return quiz;
    } catch (error) {
      throw this.handleError(error, 'QuizService.createQuiz');
    }
  }

  async getPublicQuizzes(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category = null,
        difficulty = null,
        search = null,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const filter = { isPublished: true };
      
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      return await this.findWithPagination(filter, {
        page,
        limit,
        populate: ['author'],
        sort,
        select: '-questions.answer -questions.explanation'
      });
    } catch (error) {
      throw this.handleError(error, 'QuizService.getPublicQuizzes');
    }
  }

  async getUserQuizzes(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        isPublished = null
      } = options;

      const filter = { author: userId };
      if (isPublished !== null) filter.isPublished = isPublished;

      return await this.findWithPagination(filter, {
        page,
        limit,
        sort: { createdAt: -1 }
      });
    } catch (error) {
      throw this.handleError(error, 'QuizService.getUserQuizzes');
    }
  }

  async getQuizById(quizId, userId = null) {
    try {
      const quiz = await this.findById(quizId, ['author']);
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // If user is not the author and quiz is not published, deny access
      if (!quiz.isPublished && (!userId || quiz.author._id.toString() !== userId.toString())) {
        throw new Error('Quiz not found or access denied');
      }

      // Remove sensitive information for non-authors
      if (!userId || quiz.author._id.toString() !== userId.toString()) {
        quiz.questions = quiz.questions.map(q => ({
          ...q.toObject(),
          answer: undefined,
          explanation: undefined
        }));
      }

      return quiz;
    } catch (error) {
      throw this.handleError(error, 'QuizService.getQuizById');
    }
  }

  async updateQuiz(quizId, userId, updateData) {
    try {
      const quiz = await this.findById(quizId);
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      if (quiz.author.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update this quiz');
      }

      const updatedQuiz = await this.updateById(quizId, {
        ...updateData,
        updatedAt: new Date()
      });

      await this.logAudit('UPDATE_QUIZ', quizId, userId, {
        title: updatedQuiz.title,
        changes: Object.keys(updateData)
      });

      return updatedQuiz;
    } catch (error) {
      throw this.handleError(error, 'QuizService.updateQuiz');
    }
  }

  async deleteQuiz(quizId, userId) {
    try {
      const quiz = await this.findById(quizId);
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      if (quiz.author.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this quiz');
      }

      await this.deleteById(quizId);

      // Update subscription usage
      const subscription = await this.subscriptionRepository.findOne({ user: userId });
      if (subscription) {
        await subscription.updateUsage('quiz', -1);
      }

      await this.logAudit('DELETE_QUIZ', quizId, userId, {
        title: quiz.title
      });

      return { success: true };
    } catch (error) {
      throw this.handleError(error, 'QuizService.deleteQuiz');
    }
  }

  async publishQuiz(quizId, userId) {
    try {
      const quiz = await this.findById(quizId);
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      if (quiz.author.toString() !== userId.toString()) {
        throw new Error('Unauthorized to publish this quiz');
      }

      if (quiz.questions.length === 0) {
        throw new Error('Cannot publish quiz without questions');
      }

      const updatedQuiz = await this.updateById(quizId, {
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date()
      });

      await this.logAudit('PUBLISH_QUIZ', quizId, userId, {
        title: quiz.title
      });

      return updatedQuiz;
    } catch (error) {
      throw this.handleError(error, 'QuizService.publishQuiz');
    }
  }

  async getQuizStats(quizId, userId) {
    try {
      const quiz = await this.findById(quizId);
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      if (quiz.author.toString() !== userId.toString()) {
        throw new Error('Unauthorized to view quiz stats');
      }

      // Get attempt statistics
      const QuizAttempt = require('../models/QuizAttempt');
      const stats = await QuizAttempt.aggregate([
        { $match: { quiz: quiz._id } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            averageScore: { $avg: '$score' },
            highestScore: { $max: '$score' },
            lowestScore: { $min: '$score' },
            completionRate: {
              $avg: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        completionRate: 0
      };
    } catch (error) {
      throw this.handleError(error, 'QuizService.getQuizStats');
    }
  }

  validateQuizData(quizData) {
    const required = ['title', 'description', 'category', 'difficulty'];
    this.validateRequired(quizData, required);

    if (quizData.title.length < 3) {
      throw new Error('Quiz title must be at least 3 characters long');
    }

    if (quizData.description.length < 10) {
      throw new Error('Quiz description must be at least 10 characters long');
    }

    const validCategories = ['programming', 'math', 'science', 'history', 'language', 'general'];
    if (!validCategories.includes(quizData.category)) {
      throw new Error('Invalid category');
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(quizData.difficulty)) {
      throw new Error('Invalid difficulty level');
    }
  }
}

module.exports = QuizService;
