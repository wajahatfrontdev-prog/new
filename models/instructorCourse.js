const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the correct option
  explanation: String
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: Number,
  lessons: [{
    title: String,
    content: String,
    videoUrl: String,
    duration: Number,
    order: Number,
    resources: [{
      title: String,
      url: String,
      type: String
    }]
  }],
  quiz: {
    questions: [quizQuestionSchema],
    passingScore: { type: Number, default: 70 }
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
  visibility: { type: String, enum: ['public', 'students', 'private'], default: 'public' },
  isPublished: { type: Boolean, default: true },
  targetAudience: { type: String, enum: ['Patient', 'Doctor', 'Student', 'All'], default: 'All' }
}, { timestamps: true });

module.exports = mongoose.model('InstructorCourse', instructorCourseSchema);
