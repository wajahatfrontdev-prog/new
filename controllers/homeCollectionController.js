const LabBooking = require('../models/labBooking');
const Technician = require('../models/technician');

// @desc    Schedule home collection
// @route   POST /api/laboratories/bookings/:id/schedule-home-collection
// @access  Private (Lab/Patient)
exports.scheduleHomeCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, scheduledTime, address, location, technicianId } = req.body;

    const booking = await LabBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update home collection details
    booking.homeCollection = {
      scheduled: true,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      address,
      location: location ? {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      } : undefined,
      status: 'scheduled'
    };

    // Assign technician if provided
    if (technicianId) {
      booking.assignedTechnician = technicianId;
      
      // Update technician workload
      const technician = await Technician.findById(technicianId);
      if (technician) {
        technician.currentWorkload += 1;
        await technician.save();
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Home collection scheduled successfully',
      booking
    });
  } catch (error) {
    console.error('Error scheduling home collection:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update home collection status
// @route   PUT /api/laboratories/home-collections/:id/status
// @access  Private (Technician)
exports.updateHomeCollectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await LabBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.homeCollection || !booking.homeCollection.scheduled) {
      return res.status(400).json({ message: 'Home collection not scheduled for this booking' });
    }

    // Update status
    booking.homeCollection.status = status;

    // Track timestamps
    if (status === 'collected') {
      booking.homeCollection.collectedAt = new Date();
    } else if (status === 'delivered_to_lab') {
      booking.homeCollection.deliveredAt = new Date();
    }

    if (notes) {
      booking.homeCollection.notes = notes;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Home collection status updated',
      homeCollection: booking.homeCollection
    });
  } catch (error) {
    console.error('Error updating home collection status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get upcoming home collections
// @route   GET /api/laboratories/home-collections/upcoming
// @access  Private (Lab/Technician)
exports.getUpcomingHomeCollections = async (req, res) => {
  try {
    const { labId, technicianId } = req.query;

    const filter = {
      'homeCollection.scheduled': true,
      'homeCollection.status': { $in: ['scheduled', 'en_route'] }
    };

    if (labId) {
      filter.lab = labId;
    }

    if (technicianId) {
      filter.assignedTechnician = technicianId;
    }

    const bookings = await LabBooking.find(filter)
      .populate('patient', 'name phoneNumber')
      .populate('assignedTechnician', 'user')
      .populate('user', 'name')
      .sort({ 'homeCollection.scheduledDate': 1, 'homeCollection.scheduledTime': 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching upcoming home collections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get home collections by technician
// @route   GET /api/laboratories/home-collections/technician/:techId
// @access  Private (Technician)
exports.getTechnicianHomeCollections = async (req, res) => {
  try {
    const { techId } = req.params;
    const { date } = req.query;

    const filter = {
      assignedTechnician: techId,
      'homeCollection.scheduled': true
    };

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter['homeCollection.scheduledDate'] = {
        $gte: targetDate,
        $lt: nextDay
      };
    }

    const bookings = await LabBooking.find(filter)
      .populate('patient', 'name phoneNumber')
      .sort({ 'homeCollection.scheduledDate': 1, 'homeCollection.scheduledTime': 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching technician home collections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
