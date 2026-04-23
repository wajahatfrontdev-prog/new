const mongoose = require('mongoose');

const instructorPrecautionSchema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  title: { type: String, required: true },
  body: String,
  attachments: [Object]
}, { timestamps: true });

module.exports = mongoose.model('InstructorPrecaution', instructorPrecautionSchema);
