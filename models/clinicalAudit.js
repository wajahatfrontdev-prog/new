const mongoose = require('mongoose');

const clinicalAuditSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'CONSULTATION_COMPLETED', 'PRESCRIPTION_ISSUED', 'LAB_REPORT_UPLOADED'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // e.g., Appointment ID, LabBooking ID
  onModel: { type: String }, // e.g., 'Appointment', 'LabBooking'
  details: { type: mongoose.Schema.Types.Map, of: String },
  status: { type: String, enum: ['success', 'flagged', 'reviewed'], default: 'success' },
  flagReason: String,
}, { timestamps: true });

module.exports = mongoose.model('ClinicalAudit', clinicalAuditSchema);
