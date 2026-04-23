const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  initiateConnect,
  acceptRequest,
  rejectRequest,
  getStatus,
  getDoctorRequests,
} = require('../controllers/connectNowController');

router.post('/initiate', protect, initiateConnect);
router.post('/:requestId/accept', protect, acceptRequest);
router.post('/:requestId/reject', protect, rejectRequest);
router.get('/status/:requestId', protect, getStatus);
router.get('/doctor/pending', protect, getDoctorRequests);

module.exports = router;
