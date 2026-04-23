const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listPublicCourses, getCourseDetails, buyCourse, myPurchases, updateProgress, myCertificates, getCertificateById } = require('../controllers/studentCourseController');

const router = express.Router();

// IMPORTANT: static routes must come BEFORE the dynamic /:id route
router.get('/', protect, listPublicCourses);
router.post('/enrollments', protect, buyCourse);
router.get('/enrollments/my', protect, myPurchases);
router.put('/enrollments/:id/progress', protect, updateProgress);
router.get('/certificates/my', protect, myCertificates);
router.get('/certificates/:id', protect, getCertificateById);
// Dynamic route last to avoid shadowing static paths above
router.get('/:id', getCourseDetails);

module.exports = router;
