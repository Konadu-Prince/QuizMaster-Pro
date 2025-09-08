const Subscription = require('../models/Subscription');

// Middleware to check subscription limits
const checkSubscriptionLimit = (action) => {
  return async (req, res, next) => {
    try {
      let subscription = await Subscription.findOne({ user: req.user._id });
      
      if (!subscription) {
        subscription = new Subscription({ user: req.user._id, plan: 'free' });
        await subscription.save();
      }

      let canProceed = false;
      let errorMessage = '';

      switch (action) {
        case 'createQuiz':
          canProceed = subscription.canCreateQuiz();
          errorMessage = 'Quiz limit reached. Please upgrade your plan to create more quizzes.';
          break;
        
        case 'addQuestions':
          const additionalQuestions = req.body.questions?.length || 1;
          canProceed = subscription.canAddQuestions(additionalQuestions);
          errorMessage = 'Question limit reached. Please upgrade your plan to add more questions.';
          break;
        
        case 'useAnalytics':
          canProceed = subscription.hasFeature('analytics');
          errorMessage = 'Analytics feature requires a Pro or Enterprise plan.';
          break;
        
        case 'useCustomBranding':
          canProceed = subscription.hasFeature('customBranding');
          errorMessage = 'Custom branding feature requires a Pro or Enterprise plan.';
          break;
        
        case 'useApiAccess':
          canProceed = subscription.hasFeature('apiAccess');
          errorMessage = 'API access requires an Enterprise plan.';
          break;
        
        default:
          canProceed = true;
      }

      if (!canProceed) {
        return res.status(403).json({
          success: false,
          message: errorMessage,
          upgradeRequired: true,
          currentPlan: subscription.plan,
          limits: subscription.features,
          usage: subscription.usage
        });
      }

      // Add subscription info to request
      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Subscription middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking subscription limits'
      });
    }
  };
};

// Middleware to check if user has specific feature
const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      let subscription = await Subscription.findOne({ user: req.user._id });
      
      if (!subscription) {
        subscription = new Subscription({ user: req.user._id, plan: 'free' });
        await subscription.save();
      }

      if (!subscription.hasFeature(feature)) {
        const featureNames = {
          analytics: 'Analytics',
          customBranding: 'Custom Branding',
          apiAccess: 'API Access',
          whiteLabel: 'White Label',
          prioritySupport: 'Priority Support'
        };

        return res.status(403).json({
          success: false,
          message: `${featureNames[feature] || feature} feature requires a paid plan.`,
          upgradeRequired: true,
          currentPlan: subscription.plan,
          requiredFeature: feature
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Feature check middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking feature access'
      });
    }
  };
};

// Middleware to update usage after successful operation
const updateUsage = (type, amount = 1) => {
  return async (req, res, next) => {
    try {
      // Store original res.json to intercept the response
      const originalJson = res.json;
      
      res.json = function(data) {
        // If the operation was successful, update usage
        if (data.success && req.subscription) {
          req.subscription.updateUsage(type, amount).catch(error => {
            console.error('Error updating usage:', error);
          });
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Usage update middleware error:', error);
      next();
    }
  };
};

module.exports = {
  checkSubscriptionLimit,
  requireFeature,
  updateUsage
};


