const Reminder = require('../models/reminder');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.createReminder = async (req, res) => {
    try {
        const { patientId, patientEmail, patientName, title, disease, tablets, instructions, time, date, prescription } = req.body;
        const createdBy = req.user._id;
        const role = req.user.role;

        let targetPatientId = patientId;
        if (role === 'Patient') {
            targetPatientId = req.user._id;
        }
        if (!targetPatientId) {
            return res.status(400).json({ message: 'patientId is required' });
        }
        if (!mongoose.Types.ObjectId.isValid(targetPatientId)) {
            return res.status(400).json({ message: 'Invalid patientId' });
        }
        const patient = await User.findOne({ _id: targetPatientId, role: 'Patient' });
        if (!patient) {
            return res.status(400).json({ message: 'Patient not found' });
        }
        const reminder = await Reminder.create({
            patient: targetPatientId,
            patientEmail: patientEmail || patient.email,
            patientName: patientName || patient.name,
            title,
            disease,
            tablets: tablets || [],
            instructions,
            time,
            date,
            prescription: prescription || null,
            createdBy
        });
        const full = await Reminder.findById(reminder._id).populate('patient', 'name email').populate('createdBy', 'name email');
        res.status(201).json({ success: true, reminder: full });
    } catch (error) {
        console.error('Create Reminder Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getReminders = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user._id;
        const { patientId } = req.query;
        const filter = {};
        if (role === 'Patient') {
            filter.patient = userId;
        } else if (role === 'Doctor') {
            if (patientId) filter.patient = patientId;
            filter.createdBy = userId;
        }
        const reminders = await Reminder.find(filter).populate('patient', 'name email').populate('createdBy', 'name email').sort({ date: 1, time: 1 });
        res.status(200).json({ success: true, count: reminders.length, reminders });
    } catch (error) {
        console.error('Get Reminders Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getReminderById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const userId = req.user._id;
        const reminder = await Reminder.findById(id).populate('patient', 'name email').populate('createdBy', 'name email');
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        const allowed = reminder.patient.toString() === userId.toString() || reminder.createdBy.toString() === userId.toString();
        if (!allowed) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.status(200).json({ success: true, reminder });
    } catch (error) {
        console.error('Get Reminder Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updateReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { patientEmail, patientName, title, disease, tablets, instructions, time, date, prescription } = req.body;
        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        if (reminder.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this reminder' });
        }
        const update = {};
        if (patientEmail !== undefined) update.patientEmail = patientEmail;
        if (patientName !== undefined) update.patientName = patientName;
        if (title !== undefined) update.title = title;
        if (disease !== undefined) update.disease = disease;
        if (tablets !== undefined) update.tablets = tablets;
        if (instructions !== undefined) update.instructions = instructions;
        if (time !== undefined) update.time = time;
        if (date !== undefined) update.date = date;
        if (prescription !== undefined) update.prescription = prescription;
        const updated = await Reminder.findByIdAndUpdate(id, { $set: update }, { new: true });
        res.status(200).json({ success: true, reminder: updated });
    } catch (error) {
        console.error('Update Reminder Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        if (reminder.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this reminder' });
        }
        await Reminder.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        console.error('Delete Reminder Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
