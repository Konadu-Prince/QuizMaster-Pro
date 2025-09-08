import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const subscriptionService = {
  // Get subscription plans
  getPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response;
  },

  // Get user's current subscription
  getMySubscription: async () => {
    const response = await api.get('/subscriptions/my-subscription');
    return response;
  },

  // Create checkout session
  createCheckoutSession: async (planId) => {
    const response = await api.post('/subscriptions/create-checkout-session', { planId });
    return response;
  },

  // Create billing portal session
  createPortalSession: async () => {
    const response = await api.post('/subscriptions/create-portal-session');
    return response;
  },

  // Get plan details
  getPlanDetails: (plan) => {
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        features: [
          'Up to 5 quizzes',
          'Up to 10 questions per quiz',
          'Basic analytics',
          'Community support'
        ],
        limits: {
          maxQuizzes: 5,
          maxQuestions: 10,
          analytics: false,
          customBranding: false,
          apiAccess: false
        }
      },
      pro: {
        name: 'Pro',
        price: 9.99,
        features: [
          'Up to 50 quizzes',
          'Up to 100 questions per quiz',
          'Advanced analytics',
          'Custom branding',
          'Priority support',
          'Export data'
        ],
        limits: {
          maxQuizzes: 50,
          maxQuestions: 100,
          analytics: true,
          customBranding: true,
          apiAccess: false
        }
      },
      enterprise: {
        name: 'Enterprise',
        price: 49.99,
        features: [
          'Unlimited quizzes',
          'Unlimited questions',
          'Advanced analytics',
          'Custom branding',
          'API access',
          'White-label solution',
          'Priority support',
          'Custom integrations'
        ],
        limits: {
          maxQuizzes: -1,
          maxQuestions: -1,
          analytics: true,
          customBranding: true,
          apiAccess: true,
          whiteLabel: true
        }
      }
    };
    
    return plans[plan] || plans.free;
  },

  // Check if user can perform action
  canPerformAction: (subscription, action, amount = 1) => {
    if (!subscription) return false;
    
    switch (action) {
      case 'createQuiz':
        return subscription.canCreateQuiz;
      case 'addQuestions':
        return subscription.canAddQuestions;
      case 'useAnalytics':
        return subscription.features.analytics;
      case 'useCustomBranding':
        return subscription.features.customBranding;
      case 'useApiAccess':
        return subscription.features.apiAccess;
      default:
        return false;
    }
  },

  // Get upgrade suggestions
  getUpgradeSuggestions: (subscription, usage) => {
    const suggestions = [];
    
    if (subscription.plan === 'free') {
      if (usage.quizzesCreated >= 4) {
        suggestions.push({
          type: 'quiz_limit',
          message: 'You\'re close to your quiz limit. Upgrade to Pro for 50 quizzes!',
          plan: 'pro'
        });
      }
      
      if (usage.totalQuestions >= 8) {
        suggestions.push({
          type: 'question_limit',
          message: 'Need more questions? Pro plan allows 100 questions per quiz.',
          plan: 'pro'
        });
      }
    }
    
    if (subscription.plan === 'pro') {
      if (usage.quizzesCreated >= 45) {
        suggestions.push({
          type: 'quiz_limit',
          message: 'Approaching your quiz limit. Enterprise offers unlimited quizzes!',
          plan: 'enterprise'
        });
      }
    }
    
    return suggestions;
  }
};

export default subscriptionService;

