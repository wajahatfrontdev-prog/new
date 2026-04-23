const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  searchICDCodes,
  getICDCodesByCategory,
  getCategories
} = require('../controllers/icdController');

// All routes require authentication
router.use(protect);

// Search ICD codes
router.get('/search', searchICDCodes);

// Get categories
router.get('/categories', getCategories);

// Get codes by category
router.get('/category/:category', getICDCodesByCategory);

module.exports = router;
