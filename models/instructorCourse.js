const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true } // Index of the correct option
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [{
    title: String,
    url: String,
    description: String
  }],
  quiz: {
    questions: [quizQuestionSchema]
  }
}, { _id: false });

const instructorCourseSchema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  title: { type: String, required: true },
  caption: String,
  category: { type: String, default: 'HealthProgram' },
  healthCondition: String,
  image: String,
  modules: [moduleSchema],
  videos: [{ // Kept for backward compatibility
    title: String,
    url: String
  }],
  visibility: { type: String, enum: ['public', 'students', 'private'], default: 'public' }
}, { timestamps: true });

module.exports = mongoose.model('InstructorCourse', instructorCourseSchema);
