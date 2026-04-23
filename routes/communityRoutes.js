const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getPosts, createPost, likePost, addComment } = require('../controllers/communityController');

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', protect, createPost);
router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comment', protect, addComment);

module.exports = router;
