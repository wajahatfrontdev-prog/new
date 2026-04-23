const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientEmail: { type: String, required: true },
  patientName: { type: String, required: true },
  title: { type: String, required: true },
  disease: { type: String },
  tablets: [String],
  instructions: { type: String },
  time: { type: String },
  date: { type: Date },
  prescription: Object,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
