/**
 * Quiz Repository - Extends BaseRepository for Quiz-specific operations
 */

const BaseRepository = require('./BaseRepository');
const Quiz = require('../models/Quiz');

class QuizRepository extends BaseRepository {
  constructor() {
    super(Quiz);
  }

  // Quiz-specific methods
  async findByCategory(category, options = {}) {
    return this.find({ category, isPublished: true }, options);
  }

  async findByDifficulty(difficulty, options = {}) {
    return this.find({ difficulty, isPublished: true }, options);
  }

  async findByAuthor(authorId, options = {}) {
    return this.find({ author: authorId }, options);
  }

  async findPublished(options = {}) {
    return this.find({ isPublished: true }, options);
  }

  async findUnpublished(options = {}) {
    return this.find({ isPublished: false }, options);
  }

  async searchByTitle(title, options = {}) {
    return this.search(title, ['title', 'description', 'tags'], options);
  }

  async getPopularQuizzes(limit = 10) {
    return this.aggregate([
      { $match: { isPublished: true } },
      { $addFields: { popularityScore: { $add: ['$views', { $multiply: ['$attempts', 2] }] } } },
      { $sort: { popularityScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' }
    ]);
  }

  async getRecentQuizzes(limit = 10) {
    return this.find(
      { isPublished: true },
      {
        sort: { createdAt: -1 },
        limit,
        populate: ['author']
      }
    );
  }

  async getQuizStats(quizId) {
    return this.aggregate([
      { $match: { _id: quizId } },
      {
        $lookup: {
          from: 'quizattempts',
          localField: '_id',
          foreignField: 'quiz',
          as: 'attempts'
        }
      },
      {
        $project: {
          title: 1,
          totalAttempts: { $size: '$attempts' },
          averageScore: { $avg: '$attempts.score' },
          totalViews: 1,
          createdAt: 1,
          publishedAt: 1
        }
      }
    ]);
  }

  async incrementViews(quizId) {
    return this.updateById(quizId, { $inc: { views: 1 } });
  }

  async incrementAttempts(quizId) {
    return this.updateById(quizId, { $inc: { attempts: 1 } });
  }
}

module.exports = QuizRepository;
