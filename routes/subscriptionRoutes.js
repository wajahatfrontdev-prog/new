const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPlans,
  subscribe,
  getMySubscription,
  cancelSubscription,
  createPlan
} = require('../controllers/subscriptionController');

// Get all plans
router.get('/plans', getPlans);

// Subscribe to a plan
router.post('/subscribe', protect, subscribe);

// Get my subscription
router.get('/my-subscription', protect, getMySubscription);

// Cancel subscription
router.post('/cancel', protect, cancelSubscription);

// Admin: Create plan
router.post('/plans', protect, createPlan);

module.exports = router;
