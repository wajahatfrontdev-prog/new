const Technician = require('../models/technician');
const LabBooking = require('../models/labBooking');

// @desc    Add new technician to lab
// @route   POST /api/laboratories/:labId/technicians
// @access  Private (Lab Admin)
exports.addTechnician = async (req, res) => {
  try {
    const { labId } = req.params;
    const {
      userId,
      employeeId,
      specialization,
      certifications,
      experience,
      contactInfo,
      address,
      availability,
      maxCapacity
    } = req.body;

    // Check if employee ID already exists
    const existingTech = await Technician.findOne({ employeeId });
    if (existingTech) {
      return res.status(400).json({ message: 'Technician with this employee ID already exists' });
    }

    const technician = await Technician.create({
      laboratory: labId,
      user: userId,
      employeeId,
      specialization: specialization || ['General'],
      certifications: certifications || [],
      experience: experience || 0,
      contactInfo,
      address,
      availability: availability || {},
      maxCapacity: maxCapacity || 20
    });

    res.status(201).json({
      success: true,
      technician
    });
  } catch (error) {
    console.error('Error adding technician:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all technicians for a lab
// @route   GET /api/laboratories/:labId/technicians
// @access  Private (Lab)
exports.getTechnicians = async (req, res) => {
  try {
    const { labId } = req.params;
    const { status } = req.query;

    const filter = { laboratory: labId, isActive: true };
    if (status) {
      filter.status = status;
    }

    const technicians = await Technician.find(filter)
      .populate('user', 'name email phoneNumber')
      .sort({ 'performance.rating': -1 });

    res.status(200).json({
      success: true,
      count: technicians.length,
      technicians
    });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single technician details
// @route   GET /api/laboratories/technicians/:id
// @access  Private
exports.getTechnicianById = async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id)
      .populate('user', 'name email phoneNumber')
      .populate('laboratory', 'labName');

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    res.status(200).json({
      success: true,
      technician
    });
  } catch (error) {
    console.error('Error fetching technician:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update technician information
// @route   PUT /api/laboratories/technicians/:id
// @access  Private (Lab Admin)
exports.updateTechnician = async (req, res) => {
  try {
    let technician = await Technician.findById(req.params.id);

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    technician = await Technician.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phoneNumber');

    res.status(200).json({
      success: true,
      technician
    });
  } catch (error) {
    console.error('Error updating technician:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Deactivate technician
// @route   DELETE /api/laboratories/technicians/:id
// @access  Private (Lab Admin)
exports.deleteTechnician = async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id);

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Soft delete
    technician.isActive = false;
    technician.status = 'inactive';
    await technician.save();

    res.status(200).json({
      success: true,
      message: 'Technician deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating technician:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign technician to booking
// @route   POST /api/laboratories/bookings/:bookingId/assign-technician
// @access  Private (Lab)
exports.assignTechnician = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { technicianId } = req.body;

    const booking = await LabBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Check technician capacity
    if (technician.currentWorkload >= technician.maxCapacity) {
      return res.status(400).json({ 
        message: 'Technician has reached maximum capacity',
        currentWorkload: technician.currentWorkload,
        maxCapacity: technician.maxCapacity
      });
    }

    // Assign technician
    booking.assignedTechnician = technicianId;
    booking.assignedAt = new Date();
    await booking.save();

    // Update technician workload
    technician.currentWorkload += 1;
    await technician.save();

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      booking,
      technician
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get technician performance metrics
// @route   GET /api/laboratories/technicians/:id/performance
// @access  Private
exports.getTechnicianPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findById(id);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Calculate actual performance from bookings
    const bookings = await LabBooking.find({
      assignedTechnician: id,
      status: 'completed'
    }).select('createdAt completedAt processedAt');

    const totalTests = bookings.length;
    
    // Calculate average processing time
    let totalProcessingTime = 0;
    let completedOnTime = 0;
    let delayed = 0;

    bookings.forEach(booking => {
      if (booking.processedAt && booking.createdAt) {
        const hours = (new Date(booking.processedAt) - new Date(booking.createdAt)) / (1000 * 60 * 60);
        totalProcessingTime += hours;
        
        if (hours <= 24) {
          completedOnTime++;
        } else {
          delayed++;
        }
      }
    });

    const avgProcessingTime = totalTests > 0 ? totalProcessingTime / totalTests : 0;
    const onTimePercentage = totalTests > 0 ? (completedOnTime / totalTests) * 100 : 0;

    // Update performance metrics
    technician.performance.totalTestsProcessed = totalTests;
    technician.performance.averageProcessingTime = parseFloat(avgProcessingTime.toFixed(2));
    technician.performance.completedOnTime = completedOnTime;
    technician.performance.delayed = delayed;
    await technician.save();

    res.status(200).json({
      success: true,
      performance: {
        ...technician.performance.toObject(),
        onTimePercentage: parseFloat(onTimePercentage.toFixed(2)),
        totalBookings: totalTests
      }
    });
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available technicians (for assignment)
// @route   GET /api/laboratories/:labId/technicians/available
// @access  Private (Lab)
exports.getAvailableTechnicians = async (req, res) => {
  try {
    const { labId } = req.params;

    const technicians = await Technician.find({
      laboratory: labId,
      status: 'active',
      isActive: true,
      currentWorkload: { $lt: mongoose.Types.ObjectId('maxCapacity') } // Less than max capacity
    })
    .populate('user', 'name')
    .sort({ currentWorkload: 1 }) // Least loaded first
    .limit(10);

    res.status(200).json({
      success: true,
      count: technicians.length,
      technicians
    });
  } catch (error) {
    console.error('Error fetching available technicians:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
