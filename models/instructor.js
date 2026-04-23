const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: String,
  qualification: String,
  age: Number,
  gender: String,
  address: String,
  card: Object,
  specialties: [String],
  languages: [String],
  experience: String,
  availabilityDays: [String],
  availabilityTime: {
    start: String,
    end: String
  },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Instructor', instructorSchema);
