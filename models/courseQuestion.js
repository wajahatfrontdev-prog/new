const mongoose = require('mongoose');

const courseQuestionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'InstructorCourse', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answeredAt: { type: Date },
  isAnswered: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('CourseQuestion', courseQuestionSchema);
