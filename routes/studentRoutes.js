const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { AddStudentDetails, getAllStudents, getStudentById, getMyStudentProfile } = require('../controllers/studentController');

const router = express.Router();

router.post('/add_student_details', protect, AddStudentDetails);
router.get('/get_all_students', getAllStudents);
router.get('/me', protect, getMyStudentProfile);
router.get('/:id', getStudentById);

module.exports = router;
