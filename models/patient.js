const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gender: String,
    dateOfBirth: Date,
    profileImage: Object,
    bloodGroup: String,
    cnic: String,
    address: String,
    allergies: [String],
    medicalConditions: [String],
    currentMedications: [String],
    emergencyContact: {
        name: String,
        phone: String,
    },

    height: Number,
    weight: Number,
    points: { type: Number, default: 0 },
    badges: [{
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now }
    }],
    isVerified: { type: Boolean, default: false },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
}, { timestamps: true });


const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;