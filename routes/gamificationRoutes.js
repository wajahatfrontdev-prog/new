const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyStats, awardPoints, getLeaderboard } = require('../controllers/gamificationController');

// Get my gamification stats
router.get('/my-stats', protect, getMyStats);

// Award points (for testing or admin use)
router.post('/award-points', protect, awardPoints);

// Get leaderboard
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
