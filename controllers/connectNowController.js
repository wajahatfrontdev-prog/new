const ConnectNowRequest = require('../models/connectNowRequest');
const User = require('../models/user');
const Doctor = require('../models/doctor');
const Notification = require('../models/notification');
const pusher = require('../config/pusher.config');

// Patient initiates "Connect Now"
exports.initiateConnect = async (req, res) => {
  try {
    const patientId = req.user._id;

    // Cancel any existing pending request from this patient
    await ConnectNowRequest.updateMany(
      { patient: patientId, status: 'pending' },
      { status: 'expired' }
    );

    // Find all available doctors (notify all so any logged-in doctor can respond)
    const doctors = await User.find({ role: 'Doctor' });
    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'No doctors available right now' });
    }

    const selectedDoctors = doctors;
    const doctorIds = selectedDoctors.map(d => d._id);

    const channelName = `consult-${patientId}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    const request = await ConnectNowRequest.create({
      patient: patientId,
      notifiedDoctors: doctorIds,
      channelName,
      expiresAt,
    });

    // Notify each doctor via Pusher
    for (const doctor of selectedDoctors) {
      try {
        await pusher.trigger(`private-user-${doctor._id}`, 'connect-now-request', {
          requestId: request._id.toString(),
          patientName: req.user.name,
          patientId: patientId.toString(),
          channelName,
          expiresAt: expiresAt.toISOString(),
        });
      } catch (e) {
        console.error('Pusher trigger error:', e.message);
      }

      // Also create in-app notification
      await Notification.create({
        user: doctor._id,
        title: 'Instant Consultation Request',
        message: `${req.user.name} is requesting an instant consultation. Respond within 3 minutes.`,
        type: 'connect_now',
        data: { requestId: request._id.toString(), channelName },
      });
    }

    res.status(201).json({
      success: true,
      requestId: request._id,
      channelName,
      expiresAt,
      notifiedDoctors: doctorIds.length,
    });
  } catch (error) {
    console.error('Initiate Connect Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Doctor accepts the request
exports.acceptRequest = async (req, res) => {
  try {
    const doctorUserId = req.user._id;
    const { requestId } = req.params;

    const request = await ConnectNowRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    if (new Date() > request.expiresAt) {
      request.status = 'expired';
      await request.save();
      return res.status(400).json({ message: 'Request has expired' });
    }

    request.status = 'accepted';
    request.acceptedBy = doctorUserId;
    await request.save();

    // Notify patient via Pusher
    try {
      await pusher.trigger(`private-user-${request.patient}`, 'connect-now-accepted', {
        requestId: request._id.toString(),
        doctorId: doctorUserId.toString(),
        doctorName: req.user.name,
        channelName: request.channelName,
      });
    } catch (e) {
      console.error('Pusher trigger error:', e.message);
    }

    // Notify patient via in-app notification
    await Notification.create({
      user: request.patient,
      title: 'Doctor Joined!',
      message: `Dr. ${req.user.name} has accepted your instant consultation request.`,
      type: 'connect_now_accepted',
      data: { requestId: request._id.toString(), channelName: request.channelName },
    });

    res.json({
      success: true,
      channelName: request.channelName,
      patientId: request.patient,
    });
  } catch (error) {
    console.error('Accept Request Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Doctor rejects the request
exports.rejectRequest = async (req, res) => {
  try {
    const doctorUserId = req.user._id;
    const { requestId } = req.params;

    const request = await ConnectNowRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    // Add to rejected list
    request.rejectedBy.push(doctorUserId);

    // If all notified doctors rejected → notify admin
    const allRejected = request.notifiedDoctors.every(id =>
      request.rejectedBy.some(r => r.toString() === id.toString())
    );

    if (allRejected && !request.adminNotified) {
      request.adminNotified = true;
      await _notifyAdmin(request);
    }

    await request.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Reject Request Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Poll status (patient checks if doctor accepted)
exports.getStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ConnectNowRequest.findById(requestId)
      .populate('acceptedBy', 'name');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Auto-expire if time passed
    if (request.status === 'pending' && new Date() > request.expiresAt) {
      request.status = 'expired';
      if (!request.adminNotified) {
        request.adminNotified = true;
        await _notifyAdmin(request);
      }
      await request.save();
    }

    res.json({
      success: true,
      status: request.status,
      channelName: request.channelName,
      acceptedBy: request.acceptedBy ? {
        id: request.acceptedBy._id,
        name: request.acceptedBy.name,
      } : null,
      expiresAt: request.expiresAt,
    });
  } catch (error) {
    console.error('Get Status Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get pending requests for a doctor
exports.getDoctorRequests = async (req, res) => {
  try {
    const doctorUserId = req.user._id;

    const requests = await ConnectNowRequest.find({
      notifiedDoctors: doctorUserId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('patient', 'name');

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get Doctor Requests Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper: notify admin
async function _notifyAdmin(request) {
  try {
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'No Doctor Available',
        message: `A patient's instant consultation request expired with no doctor response. Patient ID: ${request.patient}`,
        type: 'connect_now_expired',
        data: { requestId: request._id.toString(), patientId: request.patient.toString() },
      });
      try {
        await pusher.trigger(`private-user-${admin._id}`, 'connect-now-expired', {
          requestId: request._id.toString(),
          patientId: request.patient.toString(),
        });
      } catch (e) {}
    }
  } catch (e) {
    console.error('Notify admin error:', e);
  }
}
