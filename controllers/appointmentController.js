const Appointment = require('../models/appointment')
const User = require('../models/user');
const Doctor = require('../models/doctor');
const { sendPushNotification } = require('../config/firebase');
const Notification = require('../models/notification');


exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;
        const patientId = req.user._id;

        console.log('📅 Booking appointment request:');
        console.log('Doctor ID:', doctorId);
        console.log('Patient ID:', patientId);
        console.log('Date:', date);
        console.log('Time Slot:', timeSlot);

        const doctorDoc = await Doctor.findById(doctorId).populate('user');
        console.log("🚀 ~ doctorDoc:", doctorDoc);
        
        if (!doctorDoc || !doctorDoc.user) {
            return res.status(400).json({ message: 'Invalid doctor ID' });
        }

        const doctorUserId = doctorDoc.user._id;
        console.log("✅ Doctor User ID:", doctorUserId);

        const appointment = await Appointment.create({
            doctor: doctorUserId,
            patient: patientId,
            date,
            timeSlot,
            reason
        });

        console.log('✅ Appointment created successfully:', appointment._id);

        // Notify doctor about new appointment
        try {
          const doctorUser = await User.findById(doctorUserId).select('fcmToken name');
          const patientUser = await User.findById(patientId).select('name');
          if (doctorUser?.fcmToken) {
            await sendPushNotification(
              doctorUser.fcmToken,
              'New Appointment Booked',
              `${patientUser?.name || 'A patient'} booked an appointment on ${date}`,
              { type: 'appointment', appointmentId: appointment._id.toString() }
            );
          }
          await Notification.create({
            user: doctorUserId,
            type: 'appointment',
            title: 'New Appointment',
            message: `${patientUser?.name || 'A patient'} booked an appointment on ${date}`,
            relatedId: appointment._id,
            relatedModel: 'Appointment',
          });
        } catch (notifErr) {
          console.warn('Appointment notification failed (non-critical):', notifErr.message);
        }

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
            success: true
        });

    } catch (error) {
        console.error('❌ Book Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        console.log('📋 Fetching appointments for:', role, userId);

        let filter = {}

        if (role === 'Patient') {
            filter.patient = userId
        } else if (role === 'Doctor') {
            filter.doctor = userId
        } else {
            return res.status(403).json({ message: "Only doctors or patients can view appointments" });
        }

        console.log('🔍 Filter:', filter);

        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name email phoneNumber')
            .populate('patient', 'name email phoneNumber')
            .sort({ date: -1 });

        console.log(`✅ Found ${appointments.length} appointments`);

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.log('❌ Get Appointment Error', error)
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        const userId = req.user._id;

        console.log('📝 Updating appointment:', appointmentId, 'to status:', status);

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }

        appointment.status = status;
        await appointment.save();

        console.log('✅ Appointment status updated');

        // Award points if completed
        if (status === 'completed') {
          try {
            const Patient = require("../models/patient");
            await Patient.findOneAndUpdate(
              { user: appointment.patient },
              {
                $inc: { points: 50 },
                $addToSet: { badges: { name: "Health Warrior", icon: "verified" } }
              }
            );
            console.log(`✅ 50 points awarded to user ${appointment.patient} for completing consultation`);
          } catch (awardErr) {
            console.error("❌ Failed to award points for consultation completion:", awardErr);
          }
        }

        // Notify patient about status change
        try {
          const patient = await User.findById(appointment.patient).select('fcmToken name');
          const doctor = await User.findById(userId).select('name');
          if (patient?.fcmToken) {
            await sendPushNotification(
              patient.fcmToken,
              'Appointment Update',
              `Dr. ${doctor?.name || 'Your doctor'} ${status} your appointment`,
              { type: 'appointment', appointmentId: appointment._id.toString(), status }
            );
          }
          await Notification.create({
            user: appointment.patient,
            type: 'appointment',
            title: 'Appointment Update',
            message: `Your appointment has been ${status} by Dr. ${doctor?.name || 'your doctor'}`,
            relatedId: appointment._id,
            relatedModel: 'Appointment',
          });
        } catch (notifErr) {
          console.warn('Status notification failed (non-critical):', notifErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            appointment
        });

    } catch (error) {
        console.error('❌ Update Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, timeSlot, reason, status } = req.body;
        const userId = req.user._id;
        const role = req.user.role;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const isParticipant = appointment.patient.toString() === userId.toString() || appointment.doctor.toString() === userId.toString();
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }

        const update = {};
        if (date !== undefined) update.date = date;
        if (timeSlot !== undefined) update.timeSlot = timeSlot;
        if (reason !== undefined) update.reason = reason;
        if (status !== undefined) {
            if (role === 'Doctor') {
                update.status = status;
            } else if (role === 'Patient' && status === 'cancelled') {
                update.status = status;
            } else {
                return res.status(403).json({ message: 'Not allowed to set this status' });
            }
        }

        const updated = await Appointment.findByIdAndUpdate(id, { $set: update }, { new: true });
        res.status(200).json({ success: true, appointment: updated });
    } catch (error) {
        console.error('Update Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const isParticipant = appointment.patient.toString() === userId.toString() || appointment.doctor.toString() === userId.toString();
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to delete this appointment' });
        }

        await Appointment.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Appointment deleted' });
    } catch (error) {
        console.error('Delete Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;
        const role = req.user.role;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const isParticipant = appointment.patient.toString() === userId.toString() || appointment.doctor.toString() === userId.toString();
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }
        const cancelledBy = appointment.doctor.toString() === userId.toString() ? 'Doctor' : 'Patient';
        const update = {
            status: 'cancelled',
            cancellationReason: reason || null,
            cancelledBy,
            cancelledAt: new Date()
        };
        const updated = await Appointment.findByIdAndUpdate(id, { $set: update }, { new: true });
        res.status(200).json({ success: true, appointment: updated });
    } catch (error) {
        console.error('Cancel Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getUpcomingAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const windowHours = parseInt(req.query.windowHours || '24', 10);
        const now = new Date();
        const until = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

        const filter = {
            date: { $gte: now, $lte: until },
            status: { $in: ['pending', 'confirmed'] }
        };
        if (role === 'Patient') {
            filter.patient = userId;
        } else if (role === 'Doctor') {
            filter.doctor = userId;
        } else {
            return res.status(403).json({ message: 'Only doctors or patients can view upcoming appointments' });
        }
        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name email')
            .populate('patient', 'name email')
            .sort({ date: 1 });
        res.status(200).json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error('Get Upcoming Appointments Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
