const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  AddLaboratoryDetails, 
  getAllLaboratories, 
  getLaboratoryById, 
  FilterLaboratories, 
  AddLaboratoryReview, 
  getLaboratoryProfile,
  uploadStructuredResults,
  getStructuredResults,
  getResultHistory,
  getProcessingTimeMetrics,
  getQualityMetrics,
  getVolumeTrends,
  getUrgentCasesStats,
  getRevenueAnalytics,
  getPeakHoursAnalysis,
  getComparativeAnalytics
} = require('../controllers/laboratoryController');
const { createBooking, getMyBookings, getLabBookings, getBookingById, updateBooking, cancelBooking, deleteBooking } = require('../controllers/labBookingController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/reports');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post('/add_laboratory_details', protect, AddLaboratoryDetails);
router.get('/get_all_laboratories', getAllLaboratories);
router.get('/filter', FilterLaboratories);
router.get('/profile', protect, getLaboratoryProfile);
router.get('/bookings/my', protect, getMyBookings);
router.post('/:id/reviews', protect, AddLaboratoryReview);
router.post('/:labId/bookings', protect, createBooking);
router.get('/:labId/bookings', protect, getLabBookings);
router.get('/bookings/:id', protect, getBookingById);
router.put('/bookings/:id', protect, updateBooking);
router.put('/bookings/:id/cancel', protect, cancelBooking);
router.delete('/bookings/:id', protect, deleteBooking);
router.post('/bookings/:id/upload-report', protect, upload.single('report'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const reportUrl = `${req.protocol}://${req.get('host')}/uploads/reports/${req.file.filename}`;
    res.status(200).json({ success: true, reportUrl });
});

// Structured results endpoints
router.post('/bookings/:id/upload-structured-results', protect, uploadStructuredResults);
router.get('/bookings/:id/structured-results', protect, getStructuredResults);
router.get('/results/history/:patientId/:testParameter', protect, getResultHistory);

// Analytics endpoints
router.get('/:labId/analytics/processing-time', protect, getProcessingTimeMetrics);
router.get('/:labId/analytics/quality', protect, getQualityMetrics);
router.get('/:labId/analytics/volume', protect, getVolumeTrends);
router.get('/:labId/analytics/urgent-cases', protect, getUrgentCasesStats);
router.post('/:labId/analytics/revenue', protect, getRevenueAnalytics);
router.get('/:labId/analytics/peak-hours', protect, getPeakHoursAnalysis);
router.post('/:labId/analytics/comparative', protect, getComparativeAnalytics);

router.get('/:id', getLaboratoryById);

module.exports = router;
