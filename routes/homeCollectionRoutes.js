const express = require('express');
const router = express.Router();
const homeCollectionController = require('../controllers/homeCollectionController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.use(protect);

router.post('/bookings/:id/schedule-home-collection', homeCollectionController.scheduleHomeCollection);
router.put('/home-collections/:id/status', homeCollectionController.updateHomeCollectionStatus);
router.get('/home-collections/upcoming', homeCollectionController.getUpcomingHomeCollections);
router.get('/home-collections/technician/:techId', homeCollectionController.getTechnicianHomeCollections);

module.exports = router;
