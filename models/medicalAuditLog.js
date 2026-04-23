const mongoose = require('mongoose');

const medicalAuditLogSchema = new mongoose.Schema({
  recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
  recordType: { type: String, enum: ['MedicalRecord', 'IntakeNotes', 'SoapNotes'], required: true },
  accessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['VIEW', 'EXPORT', 'PRINT', 'UPDATE'], default: 'VIEW' },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('MedicalAuditLog', medicalAuditLogSchema);
