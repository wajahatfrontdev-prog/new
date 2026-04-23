const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createCourse, listCourses, getCourseById, updateCourse, deleteCourse, assignCourse } = require('../controllers/instructorCourseController');

const router = express.Router();

router.get('/', listCourses);
router.get('/:id', getCourseById);
router.post('/', protect, createCourse);
router.post('/assign', protect, assignCourse);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

module.exports = router;
