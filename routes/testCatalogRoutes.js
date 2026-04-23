const express = require('express');
const router = express.Router();
const testCatalogController = require('../controllers/testCatalogController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', testCatalogController.getAllTests);
router.get('/:id', testCatalogController.getTestById);
router.get('/category/:category', testCatalogController.getTestsByCategory);
router.get('/search', testCatalogController.searchTests);
router.get('/categories', testCatalogController.getCategories);
router.get('/popular', testCatalogController.getPopularTests);

// Admin only routes
router.post('/', protect, admin, testCatalogController.createTest);
router.put('/:id', protect, admin, testCatalogController.updateTest);
router.delete('/:id', protect, admin, testCatalogController.deleteTest);

module.exports = router;
