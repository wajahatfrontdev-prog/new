const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createReminder, getReminders, getReminderById, updateReminder, deleteReminder } = require('../controllers/reminderController');

const router = express.Router();

router.post('/', protect, createReminder);
router.get('/', protect, getReminders);
router.get('/:id', protect, getReminderById);
router.put('/:id', protect, updateReminder);
router.delete('/:id', protect, deleteReminder);

module.exports = router;
