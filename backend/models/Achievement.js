const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['quiz_creation', 'quiz_taking', 'streak', 'social', 'milestone', 'special'],
    required: true
  },
  type: {
    type: String,
    enum: ['count', 'streak', 'score', 'time', 'social', 'custom'],
    required: true
  },
  criteria: {
    // For count-based achievements
    count: {
      type: Number,
      required: false
    },
    // For streak-based achievements
    streak: {
      type: Number,
      required: false
    },
    // For score-based achievements
    score: {
      type: Number,
      required: false
    },
    // For time-based achievements
    timeLimit: {
      type: Number, // in seconds
      required: false
    },
    // For custom achievements
    customCondition: {
      type: String,
      required: false
    }
  },
  points: {
    type: Number,
    required: true,
    default: 10,
    min: 1
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
achievementSchema.index({ category: 1, type: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ rarity: 1 });

// Static method to get achievements by category
achievementSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ points: 1 });
};

// Static method to get achievements by type
achievementSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true }).sort({ points: 1 });
};

// Static method to get all active achievements
achievementSchema.statics.getActive = function() {
  return this.find({ isActive: true }).sort({ category: 1, points: 1 });
};

// Instance method to check if achievement is unlocked
achievementSchema.methods.checkUnlock = function(userStats) {
  switch (this.type) {
    case 'count':
      return userStats.count >= this.criteria.count;
    case 'streak':
      return userStats.streak >= this.criteria.streak;
    case 'score':
      return userStats.score >= this.criteria.score;
    case 'time':
      return userStats.time <= this.criteria.timeLimit;
    case 'social':
      return userStats.social >= this.criteria.count;
    default:
      return false;
  }
};

module.exports = mongoose.model('Achievement', achievementSchema);


