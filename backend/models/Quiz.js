const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Answer text is required'],
    trim: true,
    maxlength: [200, 'Answer text cannot exceed 200 characters'],
  },
  correct: {
    type: Boolean,
    required: [true, 'Answer correctness must be specified'],
  },
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters'],
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-in-the-blank'],
    default: 'multiple-choice',
  },
  answers: [answerSchema],
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1'],
    max: [10, 'Points cannot exceed 10'],
  },
  timeLimit: {
    type: Number, // in seconds
    default: 60,
    min: [10, 'Time limit must be at least 10 seconds'],
    max: [600, 'Time limit cannot exceed 10 minutes'],
  },
  image: {
    type: String, // Cloudinary URL
    default: null,
  },
  order: {
    type: Number,
    required: true,
  },
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'general',
      'science',
      'history',
      'math',
      'language',
      'technology',
      'sports',
      'entertainment',
      'other'
    ],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  questions: [questionSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  settings: {
    timeLimit: {
      type: Number, // Total time limit in minutes
      default: null,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    showExplanations: {
      type: Boolean,
      default: true,
    },
    allowRetake: {
      type: Boolean,
      default: true,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    randomizeOptions: {
      type: Boolean,
      default: false,
    },
    passPercentage: {
      type: Number,
      default: 70, // percentage
      min: 0,
      max: 100,
    },
  },
  stats: {
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    averageTime: {
      type: Number, // in seconds
      default: 0,
    },
    completionRate: {
      type: Number, // percentage
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  featured: {
    type: Boolean,
    default: false,
  },
  featuredUntil: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
quizSchema.index({ author: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ isPremium: 1 });
quizSchema.index({ featured: 1 });
quizSchema.index({ 'stats.rating': -1 });
quizSchema.index({ 'stats.totalAttempts': -1 });
quizSchema.index({ createdAt: -1 });

// Text search index
quizSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

// Virtual for total questions
quizSchema.virtual('totalQuestions').get(function() {
  return this.questions.length;
});

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual for estimated time
quizSchema.virtual('estimatedTime').get(function() {
  if (this.settings.timeLimit) {
    return this.settings.timeLimit;
  }
  return Math.ceil(this.questions.reduce((total, question) => total + question.timeLimit, 0) / 60);
});

// Pre-save middleware to update stats
quizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    // Update question order if not set
    this.questions.forEach((question, index) => {
      if (!question.order) {
        question.order = index + 1;
      }
    });
  }
  next();
});

// Method to calculate average score
quizSchema.methods.updateStats = async function() {
  const QuizAttempt = mongoose.model('QuizAttempt');
  
  const stats = await QuizAttempt.aggregate([
    { $match: { quiz: this._id } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averageTime: { $avg: '$timeSpent' },
        completedAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const stat = stats[0];
    this.stats.totalAttempts = stat.totalAttempts;
    this.stats.averageScore = Math.round(stat.averageScore || 0);
    this.stats.averageTime = Math.round(stat.averageTime || 0);
    this.stats.completionRate = Math.round((stat.completedAttempts / stat.totalAttempts) * 100);
  }

  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);
