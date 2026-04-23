const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCourseQuestions,
  askQuestion,
  answerQuestion,
  getUnansweredQuestions,
  deleteQuestion
} = require('../controllers/courseQuestionController');

// All routes require authentication
router.use(protect);

// Get all questions for a course
router.get('/course/:courseId', getCourseQuestions);

// Ask a question
router.post('/ask', askQuestion);

// Answer a question
router.put('/:questionId/answer', answerQuestion);

// Get unanswered questions (for instructor)
router.get('/unanswered', getUnansweredQuestions);

// Delete question
router.delete('/:questionId', deleteQuestion);

module.exports = router;
