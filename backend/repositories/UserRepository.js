/**
 * User Repository - Extends BaseRepository for User-specific operations
 */

const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  // User-specific methods
  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username) {
    return this.findOne({ username: username.toLowerCase() });
  }

  async findActiveUsers(options = {}) {
    return this.find({ isActive: true }, options);
  }

  async findVerifiedUsers(options = {}) {
    return this.find({ isVerified: true }, options);
  }

  async searchUsers(searchTerm, options = {}) {
    return this.search(searchTerm, ['firstName', 'lastName', 'username', 'email'], options);
  }

  async getTopPerformers(limit = 10) {
    return this.aggregate([
      { $match: { isActive: true } },
      { $sort: { 'stats.totalScore': -1 } },
      { $limit: limit },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          avatar: 1,
          stats: 1,
          createdAt: 1
        }
      }
    ]);
  }

  async getRecentUsers(limit = 10) {
    return this.find(
      { isActive: true },
      {
        sort: { createdAt: -1 },
        limit,
        select: 'firstName lastName username email createdAt'
      }
    );
  }

  async updateUserStats(userId, statsUpdate) {
    return this.updateById(userId, {
      $inc: statsUpdate,
      lastActive: new Date()
    });
  }

  async incrementQuizCount(userId) {
    return this.updateById(userId, {
      $inc: { 'stats.quizzesCreated': 1 }
    });
  }

  async incrementAttemptCount(userId) {
    return this.updateById(userId, {
      $inc: { 'stats.quizzesTaken': 1 }
    });
  }

  async updateUserScore(userId, score) {
    return this.updateById(userId, {
      $inc: {
        'stats.totalScore': score,
        'stats.quizzesTaken': 1
      },
      $set: {
        'stats.averageScore': { $avg: ['$stats.totalScore', '$stats.quizzesTaken'] }
      }
    });
  }

  async getUserLeaderboard(limit = 50) {
    return this.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          avatar: 1,
          stats: 1,
          createdAt: 1,
          totalScore: '$stats.totalScore',
          averageScore: '$stats.averageScore',
          quizzesTaken: '$stats.quizzesTaken'
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit }
    ]);
  }

  async getUsersByRole(role, options = {}) {
    return this.find({ role }, options);
  }

  async getUsersBySubscription(plan, options = {}) {
    return this.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'user',
          as: 'subscription'
        }
      },
      { $unwind: '$subscription' },
      { $match: { 'subscription.plan': plan } },
      { $limit: options.limit || 100 }
    ]);
  }

  async deactivateUser(userId) {
    return this.updateById(userId, {
      isActive: false,
      deactivatedAt: new Date()
    });
  }

  async activateUser(userId) {
    return this.updateById(userId, {
      isActive: true,
      $unset: { deactivatedAt: 1 }
    });
  }
}

module.exports = UserRepository;
