const LabBooking = require('../models/labBooking');

// @desc    Submit booking for verification
// @route   POST /api/laboratories/bookings/:id/submit-for-verification
// @access  Private (Technician)
exports.submitForVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await LabBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if results are uploaded
    if (!booking.results || booking.results.length === 0) {
      return res.status(400).json({ message: 'No results uploaded yet' });
    }

    // Update verification status
    booking.verification = {
      status: 'pending',
      submittedBy: req.user._id,
      submittedAt: new Date()
    };

    // Add audit log
    booking.auditLog.push({
      action: 'submitted_for_verification',
      performedBy: req.user._id,
      timestamp: new Date(),
      changes: {
        verificationStatus: 'pending'
      }
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Submitted for verification successfully',
      booking
    });
  } catch (error) {
    console.error('Error submitting for verification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify and approve report
// @route   POST /api/laboratories/bookings/:id/verify-report
// @access  Private (Senior Lab/Doctor)
exports.verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const booking = await LabBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.verification || booking.verification.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending verification' });
    }

    // Update verification
    booking.verification = {
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      status: 'verified',
      comments: comments || ''
    };

    // Add audit log
    booking.auditLog.push({
      action: 'report_verified',
      performedBy: req.user._id,
      timestamp: new Date(),
      changes: {
        verificationStatus: 'verified',
        comments
      }
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Report verified and approved',
      booking
    });
  } catch (error) {
    console.error('Error verifying report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject report with reason
// @route   POST /api/laboratories/bookings/:id/reject-report
// @access  Private (Senior Lab/Doctor)
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, comments } = req.body;

    const booking = await LabBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.verification || booking.verification.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending verification' });
    }

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Update verification
    booking.verification = {
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      status: 'rejected',
      rejectionReason,
      comments: comments || ''
    };

    // Add audit log
    booking.auditLog.push({
      action: 'report_rejected',
      performedBy: req.user._id,
      timestamp: new Date(),
      changes: {
        verificationStatus: 'rejected',
        rejectionReason,
        comments
      }
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Report rejected',
      booking
    });
  } catch (error) {
    console.error('Error rejecting report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bookings pending verification
// @route   GET /api/laboratories/bookings/pending-verification
// @access  Private (Senior Lab/Doctor)
exports.getPendingVerifications = async (req, res) => {
  try {
    const { labId } = req.query;

    const filter = {
      'verification.status': 'pending'
    };

    if (labId) {
      filter.lab = labId;
    }

    const bookings = await LabBooking.find(filter)
      .populate('patient', 'name age')
      .populate('doctor', 'name')
      .populate('assignedTechnician', 'user')
      .sort({ 'verification.submittedAt': -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get audit log for a booking
// @route   GET /api/laboratories/bookings/:id/audit-log
// @access  Private
exports.getAuditLog = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await LabBooking.findById(id)
      .select('auditLog')
      .populate('auditLog.performedBy', 'name role');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      auditLog: booking.auditLog || []
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
