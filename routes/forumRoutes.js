const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createPost, getPosts, addComment, likePost } = require('../controllers/forumController');

const router = express.Router();

router.use(protect);

router.post('/', createPost);
router.get('/', getPosts);
router.post('/:postId/comment', addComment);
router.post('/:postId/like', likePost);

module.exports = router;
