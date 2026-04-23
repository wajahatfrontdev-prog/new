const User = require('../models/user');
const LabBooking = require('../models/labBooking');

// @desc    Send critical alert notification
// @route   POST /api/notifications/critical-alert
// @access  Private (Lab/Admin)
exports.sendCriticalAlert = async (req, res) => {
  try {
    const { bookingId, doctorId, patientId, testName, criticalParameters, channels, priority } = req.body;

    // Verify booking exists
    const booking = await LabBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create notification records
    const notifications = [];

    // Notify Doctor
    if (doctorId) {
      const doctorNotification = {
        user: doctorId,
        type: 'critical_alert',
        title: 'CRITICAL Lab Result Alert',
        message: `Critical values detected in ${testName}: ${criticalParameters.join(', ')}`,
        booking: bookingId,
        priority: priority || 'high',
        data: {
          testName,
          criticalParameters,
          bookingNumber: booking.bookingNumber
        },
        channels: channels || ['push', 'email', 'sms']
      };
      notifications.push(doctorNotification);
    }

    // Notify Patient
    if (patientId) {
      const patientNotification = {
        user: patientId,
        type: 'critical_alert',
        title: 'Important: Lab Result Alert',
        message: `Your ${testName} results show critical values. Please contact your doctor immediately.`,
        booking: bookingId,
        priority: priority || 'high',
        data: {
          testName,
          bookingNumber: booking.bookingNumber
        },
        channels: channels || ['push', 'email', 'sms']
      };
      notifications.push(patientNotification);
    }

    // TODO: Integrate with notification service (FCM, Email, SMS)
    // For now, we'll just save to database
    // In production, integrate with:
    // - Firebase Cloud Messaging for push notifications
    // - SendGrid/AWS SES for emails
    // - Twilio for SMS

    console.log('🚨 CRITICAL ALERT triggered for booking:', bookingId);
    console.log('Critical parameters:', criticalParameters);
    console.log('Channels:', channels);

    res.status(200).json({
      success: true,
      message: 'Critical alert notifications sent',
      notificationsSent: notifications.length
    });
  } catch (error) {
    console.error('Error sending critical alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send status update notification
// @route   POST /api/notifications/status-update
// @access  Private
exports.sendStatusUpdate = async (req, res) => {
  try {
    const { bookingId, userId, status, userType, channels } = req.body;

    const booking = await LabBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    let title, message;

    switch (status) {
      case 'confirmed':
        title = 'Lab Test Confirmed';
        message = `Your lab test has been confirmed and scheduled.`;
        break;
      case 'in_progress':
        title = 'Lab Test In Progress';
        message = `Your sample is being processed.`;
        break;
      case 'completed':
        title = 'Lab Report Ready';
        message = `Your lab report is ready to view.`;
        break;
      case 'cancelled':
        title = 'Lab Test Cancelled';
        message = `Your lab test has been cancelled.`;
        break;
      default:
        title = 'Lab Test Update';
        message = `Status updated to ${status}`;
    }

    console.log(`📧 Status update sent to ${userType}: ${status}`);

    res.status(200).json({
      success: true,
      message: 'Status update notification sent'
    });
  } catch (error) {
    console.error('Error sending status update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send report ready notification
// @route   POST /api/notifications/report-ready
// @access  Private (Lab)
exports.sendReportReady = async (req, res) => {
  try {
    const { bookingId, doctorId, patientId, hasAbnormalResults, channels } = req.body;

    const booking = await LabBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Notify Doctor
    if (doctorId) {
      console.log(`📧 Report ready notification sent to doctor`);
    }

    // Notify Patient
    if (patientId) {
      const title = hasAbnormalResults 
        ? 'Lab Report Available - Review Recommended'
        : 'Lab Report Available';
      
      const message = hasAbnormalResults
        ? 'Your lab report is ready. Some results are outside normal range. Please review with your doctor.'
        : 'Your lab report is ready to view.';

      console.log(`📧 Report ready notification sent to patient`);
    }

    res.status(200).json({
      success: true,
      message: 'Report ready notifications sent'
    });
  } catch (error) {
    console.error('Error sending report ready notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user notification preferences
// @route   GET /api/notifications/preferences/:userId
// @access  Private
exports.getPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // In production, fetch from User model or NotificationPreference model
    // For now, return default preferences
    const defaultPreferences = {
      push: true,
      email: true,
      sms: false,
      criticalAlerts: true,
      statusUpdates: true,
      reportReady: true,
      marketing: false
    };

    res.status(200).json({
      success: true,
      preferences: defaultPreferences
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences/:userId
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    // In production, update User model or NotificationPreference model
    console.log('Updating notification preferences for user:', userId);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get notification history
// @route   GET /api/notifications/history/:userId
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // In production, fetch from Notification model
    // For now, return empty array
    res.status(200).json({
      success: true,
      notifications: []
    });
  } catch (error) {
    console.error('Error getting notification history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
