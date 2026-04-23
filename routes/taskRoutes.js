const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createTask, getMyTasks, updateTaskStatus } = require('../controllers/taskController');

const router = express.Router();

router.post('/', protect, createTask);
router.get('/my', protect, getMyTasks);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
