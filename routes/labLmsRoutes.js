const express = require('express');
const router = express.Router();
const labLmsController = require('../controllers/labLmsIntegrationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/recommendations/:patientId', labLmsController.getHealthRecommendations);
router.post('/auto-recommend', labLmsController.autoRecommendPrograms);
router.get('/health-score/:patientId', labLmsController.getHealthScore);

module.exports = router;
