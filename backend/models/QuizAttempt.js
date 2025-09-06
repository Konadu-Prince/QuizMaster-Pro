const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'timeout'],
    default: 'in-progress',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Indexes for better performance
quizAttemptSchema.index({ quiz: 1, user: 1 });
quizAttemptSchema.index({ user: 1, createdAt: -1 });
quizAttemptSchema.index({ quiz: 1, createdAt: -1 });
quizAttemptSchema.index({ status: 1 });
quizAttemptSchema.index({ score: -1 });
quizAttemptSchema.index({ percentage: -1 });

// Virtual for duration
quizAttemptSchema.virtual('duration').get(function() {
  if (this.completedAt) {
    return Math.round((this.completedAt - this.startedAt) / 1000);
  }
  return Math.round((Date.now() - this.startedAt) / 1000);
});

// Pre-save middleware to calculate score and percentage
quizAttemptSchema.pre('save', function(next) {
  if (this.isModified('answers') && this.answers.length > 0) {
    // Calculate score
    this.score = this.answers.reduce((total, answer) => total + (answer.isCorrect ? answer.points : 0), 0);
    
    // Calculate percentage
    const totalPoints = this.answers.reduce((total, answer) => total + answer.points, 0);
    this.percentage = totalPoints > 0 ? Math.round((this.score / totalPoints) * 100) : 0;
    
    // Check if passed (assuming 60% is passing)
    this.passed = this.percentage >= 60;
  }
  
  // Set completedAt if status is completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Method to get detailed results
quizAttemptSchema.methods.getDetailedResults = function() {
  const results = {
    attemptId: this._id,
    quiz: this.quiz,
    user: this.user,
    score: this.score,
    percentage: this.percentage,
    timeSpent: this.timeSpent,
    status: this.status,
    passed: this.passed,
    startedAt: this.startedAt,
    completedAt: this.completedAt,
    answers: this.answers.map(answer => ({
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect: answer.isCorrect,
      timeSpent: answer.timeSpent,
      points: answer.points,
    })),
    feedback: this.feedback,
    rating: this.rating,
    review: this.review,
  };
  
  return results;
};

// Static method to get user's quiz history
quizAttemptSchema.statics.getUserHistory = function(userId, limit = 10, skip = 0) {
  return this.find({ user: userId })
    .populate('quiz', 'title category difficulty')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get quiz statistics
quizAttemptSchema.statics.getQuizStats = function(quizId) {
  return this.aggregate([
    { $match: { quiz: mongoose.Types.ObjectId(quizId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averagePercentage: { $avg: '$percentage' },
        averageTimeSpent: { $avg: '$timeSpent' },
        passRate: {
          $avg: { $cond: ['$passed', 1, 0] }
        },
        completionRate: {
          $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
