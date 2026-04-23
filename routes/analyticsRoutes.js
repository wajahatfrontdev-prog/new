const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getInstructorAnalytics, exportAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/instructor-stats', protect, getInstructorAnalytics);
router.post('/export', protect, exportAnalytics);

module.exports = router;
