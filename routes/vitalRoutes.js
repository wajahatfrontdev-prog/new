const express = require('express');
const router = express.Router();
const vitalController = require('../controllers/vitalController');
const { protect } = require('../middleware/authMiddleware');

// All vital routes are protected by JWT authentication
router.use(protect);

router.post('/', vitalController.addVital);
router.get('/', vitalController.getMyVitals);
router.delete('/:id', vitalController.deleteVital);

module.exports = router;
