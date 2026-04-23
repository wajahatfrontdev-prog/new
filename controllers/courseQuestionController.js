const CourseQuestion = require('../models/courseQuestion');
const InstructorCourse = require('../models/instructorCourse');
const Notification = require('../models/notification');

// Get all questions for a course
exports.getCourseQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const questions = await CourseQuestion.find({ course: courseId })
      .populate('student', 'name email')
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Get Course Questions Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Ask a question (student)
exports.askQuestion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Get course to find instructor
    const course = await InstructorCourse.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newQuestion = await CourseQuestion.create({
      course: courseId,
      student: userId,
      question: question.trim()
    });

    const populatedQuestion = await CourseQuestion.findById(newQuestion._id)
      .populate('student', 'name email')
      .populate('course', 'title');

    // Notify instructor
    if (course.instructor && course.instructor.user) {
      await Notification.create({
        user: course.instructor.user,
        title: 'New Question on Your Course',
        message: `A student asked: "${question.substring(0, 50)}..."`,
        type: 'course_question',
        relatedId: newQuestion._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Question posted successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Ask Question Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Answer a question (instructor)
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { questionId } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    const question = await CourseQuestion.findById(questionId)
      .populate('student', 'name email')
      .populate('course', 'title');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.answer = answer.trim();
    question.instructor = userId;
    question.answeredAt = new Date();
    question.isAnswered = true;
    await question.save();

    // Notify student
    await Notification.create({
      user: question.student._id,
      title: 'Your Question Was Answered',
      message: `Instructor answered your question on "${question.course.title}"`,
      type: 'question_answered',
      relatedId: questionId
    });

    res.status(200).json({
      success: true,
      message: 'Answer posted successfully',
      question
    });
  } catch (error) {
    console.error('Answer Question Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unanswered questions for instructor
exports.getUnansweredQuestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const Instructor = require('../models/instructor');

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }

    // Get instructor's courses
    const courses = await InstructorCourse.find({ instructor: instructor._id });
    const courseIds = courses.map(c => c._id);

    const questions = await CourseQuestion.find({
      course: { $in: courseIds },
      isAnswered: false
    })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Get Unanswered Questions Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    const question = await CourseQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only student who asked or instructor can delete
    if (question.student.toString() !== userId.toString() && 
        (!question.instructor || question.instructor.toString() !== userId.toString())) {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    await CourseQuestion.findByIdAndDelete(questionId);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
