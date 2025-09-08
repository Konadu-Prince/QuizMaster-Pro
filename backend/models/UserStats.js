const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Quiz Creation Stats
  quizzesCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  totalQuestionsCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  publishedQuizzes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Quiz Taking Stats
  quizzesTaken: {
    type: Number,
    default: 0,
    min: 0
  },
  totalQuestionsAnswered: {
    type: Number,
    default: 0,
    min: 0
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  
  // Performance Stats
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  bestScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  perfectScores: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Streak Stats
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastQuizDate: {
    type: Date,
    default: null
  },
  
  // Social Stats
  followers: {
    type: Number,
    default: 0,
    min: 0
  },
  following: {
    type: Number,
    default: 0,
    min: 0
  },
  quizLikes: {
    type: Number,
    default: 0,
    min: 0
  },
  quizShares: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Points and Level
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experiencePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Category-specific stats
  categoryStats: [{
    category: {
      type: String,
      enum: ['general', 'science', 'history', 'math', 'language', 'technology', 'sports', 'entertainment', 'other']
    },
    quizzesCreated: {
      type: Number,
      default: 0
    },
    quizzesTaken: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    }
  }],
  
  // Weekly/Monthly stats for streaks
  weeklyStats: {
    quizzesTaken: {
      type: Number,
      default: 0
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    weekStart: {
      type: Date,
      default: Date.now
    }
  },
  
  monthlyStats: {
    quizzesTaken: {
      type: Number,
      default: 0
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    monthStart: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userStatsSchema.index({ user: 1 });
userStatsSchema.index({ totalPoints: -1 });
userStatsSchema.index({ level: -1 });
userStatsSchema.index({ currentStreak: -1 });

// Static method to get leaderboard
userStatsSchema.statics.getLeaderboard = function(limit = 10, sortBy = 'totalPoints') {
  return this.find()
    .populate('user', 'username firstName lastName avatar')
    .sort({ [sortBy]: -1 })
    .limit(limit);
};

// Static method to get user rank
userStatsSchema.statics.getUserRank = function(userId, sortBy = 'totalPoints') {
  return this.aggregate([
    {
      $addFields: {
        rank: {
          $add: [
            {
              $size: {
                $filter: {
                  input: this.find().sort({ [sortBy]: -1 }),
                  cond: { $gt: [`$${sortBy}`, `$${sortBy}`] }
                }
              }
            },
            1
          ]
        }
      }
    },
    { $match: { user: mongoose.Types.ObjectId(userId) } }
  ]);
};

// Instance method to calculate accuracy
userStatsSchema.methods.getAccuracy = function() {
  if (this.totalQuestionsAnswered === 0) return 0;
  return Math.round((this.correctAnswers / this.totalQuestionsAnswered) * 100);
};

// Instance method to calculate level from experience
userStatsSchema.methods.calculateLevel = function() {
  // Level formula: level = floor(sqrt(experience / 100)) + 1
  return Math.floor(Math.sqrt(this.experiencePoints / 100)) + 1;
};

// Instance method to get experience needed for next level
userStatsSchema.methods.getExperienceToNextLevel = function() {
  const currentLevel = this.level;
  const nextLevelExp = Math.pow(currentLevel, 2) * 100;
  return nextLevelExp - this.experiencePoints;
};

// Instance method to add points and update level
userStatsSchema.methods.addPoints = function(points) {
  this.totalPoints += points;
  this.experiencePoints += points;
  
  const newLevel = this.calculateLevel();
  if (newLevel > this.level) {
    this.level = newLevel;
  }
  
  return this.save();
};

// Instance method to update streak
userStatsSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastQuiz = this.lastQuizDate;
  
  if (!lastQuiz) {
    this.currentStreak = 1;
  } else {
    const daysDiff = Math.floor((today - lastQuiz) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.currentStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      this.currentStreak = 1;
    }
    // If daysDiff === 0, same day, don't change streak
  }
  
  this.lastQuizDate = today;
  
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  return this.save();
};

// Instance method to update category stats
userStatsSchema.methods.updateCategoryStats = function(category, type, value) {
  let categoryStat = this.categoryStats.find(stat => stat.category === category);
  
  if (!categoryStat) {
    categoryStat = {
      category,
      quizzesCreated: 0,
      quizzesTaken: 0,
      averageScore: 0,
      totalTimeSpent: 0
    };
    this.categoryStats.push(categoryStat);
  }
  
  if (type === 'quizCreated') {
    categoryStat.quizzesCreated += 1;
  } else if (type === 'quizTaken') {
    categoryStat.quizzesTaken += 1;
  } else if (type === 'score') {
    // Update average score
    const totalQuizzes = categoryStat.quizzesTaken;
    if (totalQuizzes > 0) {
      categoryStat.averageScore = ((categoryStat.averageScore * (totalQuizzes - 1)) + value) / totalQuizzes;
    } else {
      categoryStat.averageScore = value;
    }
  } else if (type === 'time') {
    categoryStat.totalTimeSpent += value;
  }
  
  return this.save();
};

module.exports = mongoose.model('UserStats', userStatsSchema);


