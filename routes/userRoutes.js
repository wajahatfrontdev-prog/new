const express = require('express');
const { getUserProfile, updateUserProfile, saveFcmToken, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/search', protect, searchUsers);
router.put('/profile', protect, updateUserProfile);
router.post('/fcm-token', protect, saveFcmToken);

module.exports = router;
