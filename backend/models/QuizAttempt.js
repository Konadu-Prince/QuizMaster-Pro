const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  selectedAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
quizAttemptSchema.index({ quiz: 1, user: 1 });
quizAttemptSchema.index({ user: 1, createdAt: -1 });
quizAttemptSchema.index({ quiz: 1, createdAt: -1 });
quizAttemptSchema.index({ status: 1 });
quizAttemptSchema.index({ score: -1 });

// Calculate score and percentage before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.score = this.answers.reduce((total, answer) => total + answer.pointsEarned, 0);
    
    // Get total possible points from the quiz
    if (this.quiz && this.quiz.questions) {
      const totalPoints = this.quiz.questions.reduce((total, question) => total + question.points, 0);
      this.percentage = totalPoints > 0 ? Math.round((this.score / totalPoints) * 100) : 0;
    }
  }
  
  // Set end time if completed
  if (this.status === 'completed' && !this.endTime) {
    this.endTime = new Date();
  }
  
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);