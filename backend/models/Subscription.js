const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'unpaid'],
    default: 'active'
  },
  stripeCustomerId: {
    type: String,
    required: false
  },
  stripeSubscriptionId: {
    type: String,
    required: false
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: function() {
      // Free plan never expires
      if (this.plan === 'free') return null;
      // Pro and Enterprise plans expire in 30 days
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialEnd: {
    type: Date,
    required: false
  },
  usage: {
    quizzesCreated: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  features: {
    maxQuizzes: {
      type: Number,
      default: 5 // Free plan limit
    },
    maxQuestions: {
      type: Number,
      default: 10 // Free plan limit
    },
    analytics: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    whiteLabel: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ status: 1 });

// Static method to get plan limits
subscriptionSchema.statics.getPlanLimits = function(plan) {
  const limits = {
    free: {
      maxQuizzes: 5,
      maxQuestions: 10,
      analytics: false,
      customBranding: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      price: 0
    },
    pro: {
      maxQuizzes: 50,
      maxQuestions: 100,
      analytics: true,
      customBranding: true,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: true,
      price: 9.99
    },
    enterprise: {
      maxQuizzes: -1, // unlimited
      maxQuestions: -1, // unlimited
      analytics: true,
      customBranding: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
      price: 49.99
    }
  };
  
  return limits[plan] || limits.free;
};

// Instance method to check if user can create more quizzes
subscriptionSchema.methods.canCreateQuiz = function() {
  if (this.features.maxQuizzes === -1) return true; // unlimited
  return this.usage.quizzesCreated < this.features.maxQuizzes;
};

// Instance method to check if user can add more questions
subscriptionSchema.methods.canAddQuestions = function(additionalQuestions = 1) {
  if (this.features.maxQuestions === -1) return true; // unlimited
  return (this.usage.totalQuestions + additionalQuestions) <= this.features.maxQuestions;
};

// Instance method to check if feature is available
subscriptionSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true;
};

// Instance method to update usage
subscriptionSchema.methods.updateUsage = function(type, amount = 1) {
  if (type === 'quiz') {
    this.usage.quizzesCreated += amount;
  } else if (type === 'question') {
    this.usage.totalQuestions += amount;
  } else if (type === 'api') {
    this.usage.apiCalls += amount;
  }
  
  return this.save();
};

// Instance method to reset usage (for monthly cycles)
subscriptionSchema.methods.resetUsage = function() {
  this.usage.quizzesCreated = 0;
  this.usage.totalQuestions = 0;
  this.usage.apiCalls = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

// Pre-save middleware to update features based on plan
subscriptionSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    const limits = this.constructor.getPlanLimits(this.plan);
    this.features = limits;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);


