const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  saveIntakeNotes,
  getIntakeNotes,
  saveSoapNotes,
  getSoapNotes,
  createReferral,
  getMyReferrals,
  getReceivedReferrals,
  acceptReferral,
  declineReferral,
  completeReferral,
  assignProgram,
  getHealthJourney,
  logLifestyleActivity,
  getLifestyleSummary,
  addAddendum
} = require('../controllers/clinicalController');

const router = express.Router();

router.use(protect);

router.post('/intake-notes/:appointmentId', saveIntakeNotes);
router.get('/intake-notes/:appointmentId', getIntakeNotes);
router.post('/soap-notes/:appointmentId', saveSoapNotes);
router.get('/soap-notes/:appointmentId', getSoapNotes);
router.post('/addendum/:type/:appointmentId', addAddendum);

// Referral routes
router.post('/referrals', createReferral);
router.get('/referrals/my', getMyReferrals);
router.get('/referrals/received', getReceivedReferrals);
router.put('/referrals/:referralId/accept', acceptReferral);
router.put('/referrals/:referralId/decline', declineReferral);
router.put('/referrals/:referralId/complete', completeReferral);

router.post('/assign-program', assignProgram);
router.get('/health-journey', getHealthJourney);
router.post('/lifestyle-logs', logLifestyleActivity);
router.get('/lifestyle-summary', getLifestyleSummary);

module.exports = router;
