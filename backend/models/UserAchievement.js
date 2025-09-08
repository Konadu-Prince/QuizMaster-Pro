const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  metadata: {
    // Store additional data about how the achievement was unlocked
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: false
    },
    score: {
      type: Number,
      required: false
    },
    timeSpent: {
      type: Number,
      required: false
    },
    streak: {
      type: Number,
      required: false
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-achievement pairs
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

// Index for efficient queries
userAchievementSchema.index({ user: 1, isUnlocked: 1 });
userAchievementSchema.index({ unlockedAt: -1 });

// Static method to get user's achievements
userAchievementSchema.statics.getUserAchievements = function(userId, unlockedOnly = false) {
  const query = { user: userId };
  if (unlockedOnly) {
    query.isUnlocked = true;
  }
  
  return this.find(query)
    .populate('achievement')
    .sort({ unlockedAt: -1 });
};

// Static method to get user's achievement progress
userAchievementSchema.statics.getUserProgress = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievement',
        foreignField: '_id',
        as: 'achievementData'
      }
    },
    { $unwind: '$achievementData' },
    {
      $group: {
        _id: '$achievementData.category',
        total: { $sum: 1 },
        unlocked: {
          $sum: { $cond: ['$isUnlocked', 1, 0] }
        },
        points: {
          $sum: { $cond: ['$isUnlocked', '$achievementData.points', 0] }
        }
      }
    }
  ]);
};

// Static method to unlock achievement
userAchievementSchema.statics.unlockAchievement = async function(userId, achievementId, metadata = {}) {
  const existing = await this.findOne({ user: userId, achievement: achievementId });
  
  if (existing && existing.isUnlocked) {
    return existing; // Already unlocked
  }
  
  if (existing) {
    // Update existing record
    existing.isUnlocked = true;
    existing.unlockedAt = new Date();
    existing.metadata = { ...existing.metadata, ...metadata };
    return await existing.save();
  } else {
    // Create new record
    return await this.create({
      user: userId,
      achievement: achievementId,
      isUnlocked: true,
      metadata
    });
  }
};

// Static method to update progress
userAchievementSchema.statics.updateProgress = async function(userId, achievementId, progress, metadata = {}) {
  const existing = await this.findOne({ user: userId, achievement: achievementId });
  
  if (existing) {
    existing.progress = progress;
    existing.metadata = { ...existing.metadata, ...metadata };
    return await existing.save();
  } else {
    return await this.create({
      user: userId,
      achievement: achievementId,
      progress,
      metadata
    });
  }
};

module.exports = mongoose.model('UserAchievement', userAchievementSchema);


