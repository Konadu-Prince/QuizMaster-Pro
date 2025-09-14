const express = require('express');
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? require('stripe')(stripeSecret) : null;
const { protect, requirePremium } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Create Stripe customer
// @route   POST /api/payments/create-customer
// @access  Private
router.post('/create-customer', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments service not configured' });
    }
    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email: email || req.user.email,
      name: name || req.user.fullName,
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    // Update user with Stripe customer ID
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.stripeCustomerId': customer.id,
    });

    res.status(200).json({
      success: true,
      data: { customerId: customer.id },
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
    });
  }
});

// @desc    Create payment intent for subscription
// @route   POST /api/payments/create-subscription
// @access  Private
router.post('/create-subscription', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments service not configured' });
    }
    const { priceId, customerId } = req.body;

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      },
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
    });
  }
});

// @desc    Create one-time payment
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments service not configured' });
    }
    const { amount, currency = 'usd', description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      customer: req.user.subscription.stripeCustomerId,
      description,
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
    });
  }
});

// @desc    Get subscription details
// @route   GET /api/payments/subscription
// @access  Private
router.get('/subscription', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments service not configured' });
    }
    const user = await User.findById(req.user._id);

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(200).json({
        success: true,
        data: {
          subscription: null,
          status: 'inactive',
        },
      });
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    );

    res.status(200).json({
      success: true,
      data: {
        subscription,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving subscription',
    });
  }
});

// @desc    Cancel subscription
// @route   POST /api/payments/cancel-subscription
// @access  Private
router.post('/cancel-subscription', protect, requirePremium, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments service not configured' });
    }
    const user = await User.findById(req.user._id);

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period',
      data: { subscription },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
    });
  }
});

// @desc    Reactivate subscription
// @route   POST /api/payments/reactivate-subscription
// @access  Private
router.post('/reactivate-subscription', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments service not configured' });
    }
    const user = await User.findById(req.user._id);

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found',
      });
    }

    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: { subscription },
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating subscription',
    });
  }
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments service not configured' });
    }
    const { limit = 10, starting_after } = req.query;

    const charges = await stripe.charges.list({
      customer: req.user.subscription.stripeCustomerId,
      limit: parseInt(limit),
      starting_after,
    });

    res.status(200).json({
      success: true,
      data: charges,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment history',
    });
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).send('Payments webhook not configured');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleSuccessfulPayment(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleFailedPayment(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper functions for webhook handling
async function handleSubscriptionChange(subscription) {
  const customerId = subscription.customer;
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });

  if (user) {
    user.subscription.type = subscription.status === 'active' ? 'premium' : 'free';
    user.subscription.stripeSubscriptionId = subscription.id;
    user.subscription.startDate = new Date(subscription.current_period_start * 1000);
    user.subscription.endDate = new Date(subscription.current_period_end * 1000);
    await user.save();
  }
}

async function handleSubscriptionCancellation(subscription) {
  const customerId = subscription.customer;
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });

  if (user) {
    user.subscription.type = 'free';
    user.subscription.stripeSubscriptionId = null;
    user.subscription.endDate = new Date();
    await user.save();
  }
}

async function handleSuccessfulPayment(invoice) {
  // Handle successful payment logic
  console.log('Payment succeeded:', invoice.id);
}

async function handleFailedPayment(invoice) {
  // Handle failed payment logic
  console.log('Payment failed:', invoice.id);
}

module.exports = router;
