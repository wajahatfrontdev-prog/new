const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { AddInstructorDetails, getAllInstructors, getInstructorById, getMyInstructorProfile, getStats, getAssignedLearners } = require('../controllers/instructorController');

const router = express.Router();

router.post('/add_instructor_details', protect, AddInstructorDetails);
router.get('/get_all_instructors', getAllInstructors);
router.get('/stats', protect, getStats);
router.get('/me', protect, getMyInstructorProfile);
router.get('/assigned-learners', protect, getAssignedLearners);
router.get('/:id', getInstructorById);

module.exports = router;
