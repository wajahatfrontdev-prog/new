const mongoose = require('mongoose');

const connectNowRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'completed'],
    default: 'pending'
  },
  notifiedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  channelName: { type: String },
  expiresAt: { type: Date, required: true },
  adminNotified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ConnectNowRequest', connectNowRequestSchema);
