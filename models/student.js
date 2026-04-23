const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: String,
  qualification: String,
  age: Number,
  gender: String,
  address: String,
  card: Object,
  dateOfBirth: Date,
  profileImage: Object,
  educationLevel: String,
  enrolledCourses: [String],
  preferences: [String],
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
