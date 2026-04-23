const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
  laboratory: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Doctor who ordered the test
  testName: { type: String, required: true },
  urgency: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  diagnosisNotes: String, // Doctor's diagnosis for context
  specialInstructions: String, // Doctor's special instructions
  contactName: String,
  contactPhone: String,
  contactLocation: String,
  age: Number,
  date: { type: Date },
  time: { type: String },
  homeSample: { type: Boolean, default: false },
  prescription: Object,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['Laboratory', 'Patient'] },
  cancelledAt: Date,
  bookingNumber: { type: String, unique: true },
  price: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  resultNotes: { type: String, default: '' },
  reportUrl: { type: String, default: '' },
  // Enhanced lab result flagging
  results: [{
    testParameter: String,
    value: String,
    unit: String,
    referenceRange: {
      min: Number,
      max: Number,
      text: String // e.g., "70-100 mg/dL"
    },
    isAbnormal: { type: Boolean, default: false },
    severity: { type: String, enum: ['normal', 'borderline', 'abnormal', 'critical'], default: 'normal' }
  }],
  isAbnormal: { type: Boolean, default: false }, // Overall abnormal flag
  flagReason: String,
  criticalAlert: { type: Boolean, default: false }, // For critical values requiring immediate attention
  medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  processedAt: Date, // When results were uploaded
  completedAt: Date, // When booking was marked as completed
  priority: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
  assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
  assignedAt: Date,
  verification: {
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    comments: String,
    rejectionReason: String
  },
  auditLog: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    changes: mongoose.Schema.Types.Mixed
  }],
  homeCollection: {
    scheduled: { type: Boolean, default: false },
    scheduledDate: Date,
    scheduledTime: String,
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    },
    status: { 
      type: String, 
      enum: ['not_scheduled', 'scheduled', 'en_route', 'collected', 'delivered_to_lab', 'completed'],
      default: 'not_scheduled'
    },
    collectedAt: Date,
    deliveredAt: Date,
    notes: String
  }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);
