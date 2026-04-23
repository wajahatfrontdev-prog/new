const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  completedVideos: { type: Number, default: 0 },
  totalVideos: { type: Number, default: 0 },
  percent: { type: Number, default: 0 }
}, { _id: false });

const certificateSchema = new mongoose.Schema({
  title: String,
  issuedAt: Date,
  directorName: String,
  number: String
}, { _id: false });

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'InstructorCourse', required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  purchasedAt: { type: Date, default: Date.now },
  progress: progressSchema,
  quizResults: [{
    moduleIndex: Number,
    score: Number,
    totalQuestions: Number,
    passed: Boolean,
    completedAt: { type: Date, default: Date.now }
  }],
  certificate: certificateSchema
}, { timestamps: true });

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('StudentCourseEnrollment', enrollmentSchema);
