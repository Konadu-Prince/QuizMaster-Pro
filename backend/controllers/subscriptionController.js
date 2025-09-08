// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'forever',
        features: [
          'Create up to 5 quizzes',
          'Take unlimited quizzes',
          'Basic analytics',
          'Community support'
        ],
        limits: {
          quizzes: 5,
          questionsPerQuiz: 10,
          attemptsPerQuiz: 100
        },
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        interval: 'month',
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
          'Create up to 50 quizzes',
          'Advanced question types',
          'Detailed analytics',
          'Custom branding',
          'Priority support',
          'Export results',
          'API access'
        ],
        limits: {
          quizzes: 50,
          questionsPerQuiz: 100,
          attemptsPerQuiz: 1000
        },
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 49.99,
        interval: 'month',
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        features: [
          'Unlimited quizzes',
          'Unlimited questions',
          'Team collaboration',
          'Advanced integrations',
          'Custom domains',
          'White-label solution',
          'Dedicated support',
          'Full API access'
        ],
        limits: {
          quizzes: -1,
          questionsPerQuiz: -1,
          attemptsPerQuiz: -1
        },
        popular: false
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my subscription
// @route   GET /api/subscriptions/my-subscription
// @access  Private
const getMySubscription = async (req, res, next) => {
  try {
    const Subscription = require('../models/Subscription');
    
    let subscription = await Subscription.findOne({ user: req.user._id });
    
    // If no subscription exists, create a free one
    if (!subscription) {
      subscription = new Subscription({
        user: req.user._id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    }

    // Get plan details
    const planLimits = Subscription.getPlanLimits(subscription.plan);
    
    const subscriptionData = {
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.currentPeriodStart,
      endDate: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      usage: subscription.usage,
      features: planLimits,
      canCreateQuiz: subscription.canCreateQuiz(),
      canAddQuestions: subscription.canAddQuestions()
    };

    res.json({
      success: true,
      data: subscriptionData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subscription checkout session
// @route   POST /api/subscriptions/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const stripeService = require('../services/stripeService');
    const Subscription = require('../models/Subscription');

    // Check if plan is valid
    if (planId === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create checkout session for free plan'
      });
    }

    // Get or create Stripe customer
    let subscription = await Subscription.findOne({ user: req.user._id });
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeService.createCustomer(req.user);
      customerId = customer.id;
      
      if (!subscription) {
        subscription = new Subscription({
          user: req.user._id,
          plan: 'free',
          status: 'active',
          stripeCustomerId: customerId
        });
        await subscription.save();
      } else {
        subscription.stripeCustomerId = customerId;
        await subscription.save();
      }
    }

    // Get price ID for the plan
    const priceId = stripeService.getPriceIdFromPlan(planId);
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }

    // Create checkout session
    const successUrl = `${process.env.FRONTEND_URL}/dashboard?subscription=success`;
    const cancelUrl = `${process.env.FRONTEND_URL}/pricing?subscription=cancelled`;
    
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create billing portal session
// @route   POST /api/subscriptions/create-portal-session
// @access  Private
const createPortalSession = async (req, res, next) => {
  try {
    const stripeService = require('../services/stripeService');
    const Subscription = require('../models/Subscription');

    const subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const returnUrl = `${process.env.FRONTEND_URL}/dashboard`;
    const session = await stripeService.createBillingPortalSession(
      subscription.stripeCustomerId,
      returnUrl
    );

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscriptionPlans,
  getMySubscription,
  createCheckoutSession,
  createPortalSession
};