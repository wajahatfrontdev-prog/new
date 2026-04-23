const mongoose = require('mongoose');

const lifestyleTrackingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  waterIntake: { type: Number, default: 0 }, // liters
  sleepHours: { type: Number, default: 0 }, // hours
  steps: { type: Number, default: 0 }, // count
  exercise: { type: Number, default: 0 }, // minutes
  notes: String,
}, { timestamps: true });

// Compound index to ensure one entry per user per day
lifestyleTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LifestyleTracking', lifestyleTrackingSchema);
