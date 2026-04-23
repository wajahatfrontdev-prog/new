const express = require('express');
const router = express.Router();
const qaVerificationController = require('../controllers/qaVerificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.use(protect);

router.post('/bookings/:id/submit-for-verification', qaVerificationController.submitForVerification);
router.post('/bookings/:id/verify-report', qaVerificationController.verifyReport);
router.post('/bookings/:id/reject-report', qaVerificationController.rejectReport);
router.get('/bookings/pending-verification', qaVerificationController.getPendingVerifications);
router.get('/bookings/:id/audit-log', qaVerificationController.getAuditLog);

module.exports = router;
