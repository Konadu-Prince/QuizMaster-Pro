/**
 * Subscription Repository - Extends BaseRepository for Subscription-specific operations
 */

const BaseRepository = require('./BaseRepository');
const Subscription = require('../models/Subscription');

class SubscriptionRepository extends BaseRepository {
  constructor() {
    super(Subscription);
  }

  // Subscription-specific methods
  async findByUser(userId) {
    return this.findOne({ user: userId });
  }

  async findByStripeCustomerId(customerId) {
    return this.findOne({ stripeCustomerId: customerId });
  }

  async findByStripeSubscriptionId(subscriptionId) {
    return this.findOne({ stripeSubscriptionId: subscriptionId });
  }

  async findActiveSubscriptions(options = {}) {
    return this.find({ status: 'active' }, options);
  }

  async findExpiredSubscriptions(options = {}) {
    return this.find({
      status: { $in: ['cancelled', 'past_due', 'unpaid'] }
    }, options);
  }

  async findSubscriptionsByPlan(plan, options = {}) {
    return this.find({ plan }, options);
  }

  async getSubscriptionStats() {
    return this.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'active'] },
                { $multiply: ['$features.price', 1] },
                0
              ]
            }
          }
        }
      }
    ]);
  }

  async getRevenueStats() {
    return this.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalActiveSubscriptions: { $sum: 1 },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$plan', 'pro'] },
                9.99,
                { $cond: [{ $eq: ['$plan', 'enterprise'] }, 49.99, 0] }
              ]
            }
          },
          proSubscriptions: {
            $sum: { $cond: [{ $eq: ['$plan', 'pro'] }, 1, 0] }
          },
          enterpriseSubscriptions: {
            $sum: { $cond: [{ $eq: ['$plan', 'enterprise'] }, 1, 0] }
          }
        }
      }
    ]);
  }

  async getUsageStats() {
    return this.aggregate([
      {
        $group: {
          _id: null,
          totalQuizzesCreated: { $sum: '$usage.quizzesCreated' },
          totalQuestions: { $sum: '$usage.totalQuestions' },
          totalApiCalls: { $sum: '$usage.apiCalls' },
          averageQuizzesPerUser: { $avg: '$usage.quizzesCreated' }
        }
      }
    ]);
  }

  async findSubscriptionsNearLimit(limitType, threshold = 0.8) {
    const pipeline = [
      {
        $match: {
          status: 'active',
          [`usage.${limitType}`]: { $exists: true }
        }
      },
      {
        $addFields: {
          usageRatio: {
            $divide: [
              `$usage.${limitType}`,
              {
                $cond: [
                  { $eq: [`$features.max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`, -1] },
                  1,
                  `$features.max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`
                ]
              }
            ]
          }
        }
      },
      {
        $match: {
          usageRatio: { $gte: threshold }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    return this.aggregate(pipeline);
  }

  async updateUsage(userId, usageType, amount = 1) {
    const subscription = await this.findByUser(userId);
    if (subscription) {
      return subscription.updateUsage(usageType, amount);
    }
    return null;
  }

  async resetMonthlyUsage() {
    return this.updateMany(
      { status: 'active' },
      {
        'usage.quizzesCreated': 0,
        'usage.totalQuestions': 0,
        'usage.apiCalls': 0,
        'usage.lastResetDate': new Date()
      }
    );
  }

  async findExpiringSubscriptions(daysAhead = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.find({
      status: 'active',
      currentPeriodEnd: { $lte: futureDate }
    });
  }

  async getChurnRate(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          status: { $in: ['cancelled', 'past_due', 'unpaid'] },
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$plan',
          churnedCount: { $sum: 1 }
        }
      }
    ];

    return this.aggregate(pipeline);
  }
}

module.exports = SubscriptionRepository;
