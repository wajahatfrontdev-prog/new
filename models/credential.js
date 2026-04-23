const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Medical License', 'Specialization Certificate', 'Indemnity Insurance', 'Other'], required: true },
  title: { type: String, required: true },
  documentUrl: { type: String, required: true },
  expiryDate: Date,
  status: { type: String, enum: ['pending', 'verified', 'expired', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Credential', credentialSchema);
