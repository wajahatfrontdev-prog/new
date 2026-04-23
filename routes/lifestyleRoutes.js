const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTodayData,
  updateData,
  getHistory,
  getWeeklySummary
} = require('../controllers/lifestyleController');

// All routes require authentication
router.use(protect);

// Get today's data
router.get('/today', getTodayData);

// Update lifestyle data
router.put('/update', updateData);

// Get history
router.get('/history', getHistory);

// Get weekly summary
router.get('/weekly-summary', getWeeklySummary);

module.exports = router;
