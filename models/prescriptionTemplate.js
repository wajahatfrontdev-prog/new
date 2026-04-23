const mongoose = require('mongoose');

const prescriptionTemplateSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('PrescriptionTemplate', prescriptionTemplateSchema);
