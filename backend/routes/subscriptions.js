const express = require('express');
const { 
  getSubscriptionPlans, 
  getMySubscription, 
  createCheckoutSession,
  createPortalSession 
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(protect);
router.get('/my-subscription', getMySubscription);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', createPortalSession);

module.exports = router;