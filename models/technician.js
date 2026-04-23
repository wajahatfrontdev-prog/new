const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  laboratory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laboratory',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    enum: ['Phlebotomy', 'Pathology', 'Microbiology', 'Biochemistry', 'Hematology', 'General']
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  experience: {
    type: Number, // in years
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  availability: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' }
  },
  currentWorkload: {
    type: Number,
    default: 0
  },
  maxCapacity: {
    type: Number,
    default: 20 // bookings per day
  },
  performance: {
    totalTestsProcessed: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 100 },
    averageProcessingTime: { type: Number, default: 0 }, // in hours
    rating: { type: Number, default: 0 },
    completedOnTime: { type: Number, default: 0 },
    delayed: { type: Number, default: 0 }
  },
  contactInfo: {
    phone: String,
    email: String,
    emergencyContact: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
technicianSchema.index({ laboratory: 1, status: 1 });
technicianSchema.index({ employeeId: 1 }, { unique: true });
technicianSchema.index({ 'performance.rating': -1 });

module.exports = mongoose.model('Technician', technicianSchema);
