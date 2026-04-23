const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Blood Pressure', 'Heart Rate', 'Blood Glucose', 'Weight', 'Temperature', 'Oxygen Level']
    },
    value: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Normal', 'Healthy', 'Elevated', 'Low', 'High'],
        default: 'Normal'
    },
    note: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Vital', vitalSchema);
