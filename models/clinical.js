const mongoose = require('mongoose');

const intakeNotesSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chiefComplaint: String,
  history: String,
  medications: [String],
  allergies: [String],
  vitals: {
    temp: String,
    bp: String,
    pulse: String,
    weight: String
  },
  attachments: [String],
  isFinalized: { type: Boolean, default: false },
  finalizedAt: Date,
  addendums: [{
    text: String,
    signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const soapNotesSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjective: String,
  objective: String,
  assessment: String,
  plan: String,
  icdCode: String, // Req 12.10
  attachments: [String],
  isFinalized: { type: Boolean, default: false },
  finalizedAt: Date,
  addendums: [{
    text: String,
    signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const referralSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Specialist Doctor
  reason: { type: String, required: true },
  clinicalNotes: String,
  attachedRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'declined'], default: 'pending' },
  acceptedAt: Date,
  completedAt: Date,
  declineReason: String,
  consultationSummary: String,
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
}, { timestamps: true });

const lifestyleLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['water', 'steps', 'sleep', 'calories'], required: true },
  value: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = {
  IntakeNotes: mongoose.model('IntakeNotes', intakeNotesSchema),
  SoapNotes: mongoose.model('SoapNotes', soapNotesSchema),
  Referral: mongoose.model('Referral', referralSchema),
  LifestyleLog: mongoose.model('LifestyleLog', lifestyleLogSchema)
};
