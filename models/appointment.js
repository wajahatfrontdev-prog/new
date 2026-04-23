const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    reason: { type: String },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['Doctor', 'Patient'] },
    cancelledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
