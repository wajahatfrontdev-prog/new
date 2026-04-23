const Laboratory = require("../models/laboratory");
const LabBooking = require("../models/labBooking");
const TestCatalog = require("../models/testCatalog");
const mongoose = require("mongoose");

exports.AddLaboratoryDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      labName,
      ownerName,
      licenseNumber,
      isApproved,
      labEmail,
      labPhoneNumber,
      address,
      city,
      location,
      pinLocation,
      workingHours,
      openHours,
      title,
      description,
      testsOffered,
      availableTests,
      homeSampleAvailable,
    } = req.body;
    const existingProfile = await Laboratory.findOne({ user: userId }).populate(
      "user",
      "name email phoneNumber role createdAt",
    );
    if (existingProfile) {
      existingProfile.labName = labName;
      existingProfile.ownerName = ownerName;
      existingProfile.licenseNumber = licenseNumber;
      existingProfile.isApproved = isApproved;
      existingProfile.labEmail = labEmail;
      existingProfile.labPhoneNumber = labPhoneNumber;
      existingProfile.address = address;
      existingProfile.city = city;
      if (location) existingProfile.location = location;
      if (
        pinLocation &&
        typeof pinLocation.lat === "number" &&
        typeof pinLocation.lng === "number"
      ) {
        existingProfile.location = {
          type: "Point",
          coordinates: [pinLocation.lng, pinLocation.lat],
        };
      }
      existingProfile.workingHours = workingHours || openHours || existingProfile.workingHours;
      existingProfile.testsOffered = testsOffered || existingProfile.testsOffered;
      existingProfile.availableTests = availableTests || existingProfile.availableTests;
      existingProfile.title = title ?? existingProfile.title;
      existingProfile.description = description ?? existingProfile.description;
      if (typeof homeSampleAvailable === "boolean")
        existingProfile.homeSampleAvailable = homeSampleAvailable;
      await existingProfile.save();
      return res.status(200).json({
        message: "Laboratory Updated Successfully",
        existingProfile,
        success: true,
      });
    }
    const lab = await Laboratory.create({
      user: userId,
      labName,
      ownerName,
      licenseNumber,
      isApproved: isApproved ?? false,
      labEmail,
      labPhoneNumber,
      address,
      city,
      location,
      workingHours: workingHours || openHours || null,
      title,
      description,
      testsOffered: testsOffered ?? [],
      availableTests: availableTests ?? [],
      homeSampleAvailable: homeSampleAvailable ?? false,
    });
    const full = await Laboratory.findById(lab._id).populate(
      "user",
      "name email role phoneNunber createdAt",
    );
    return res.status(201).json({
      message: "Laboratory created successfully",
      laboratory: full,
      success: true,
    });
  } catch (error) {
    console.error("AddLaboratoryDetails Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllLaboratories = async (req, res) => {
  try {
    const labs = await Laboratory.find().populate(
      "user",
      "name email role phoneNumber",
    );
    res.status(200).json({ success: true, laboratories: labs });
  } catch (error) {
    console.error("Get All Laboratories Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.FilterLaboratories = async (req, res) => {
  try {
    const { q, city, test, homeSample, lat, lng, radiusKm, minRating, sort } =
      req.query;
    const useGeo = lat && lng;
    const parsedHomeSample =
      typeof homeSample !== "undefined"
        ? String(homeSample).toLowerCase() === "true"
        : undefined;
    const parsedRadius = radiusKm ? Number(radiusKm) : 10;
    const pipeline = [];
    if (useGeo) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: parsedRadius * 1000,
        },
      });
    } else {
      pipeline.push({ $match: {} });
    }
    const and = [];
    if (q) {
      and.push({
        $or: [
          { labName: { $regex: q, $options: "i" } },
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      });
    }
    if (city) {
      and.push({ city: { $regex: city, $options: "i" } });
    }
    if (test) {
      and.push({ testsOffered: { $in: [test] } });
    }
    if (typeof parsedHomeSample === "boolean") {
      and.push({ homeSampleAvailable: parsedHomeSample });
    }
    if (and.length) pipeline.push({ $match: { $and: and } });
    pipeline.push({
      $addFields: {
        avgRating: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ["$ratings", []] } }, 0] },
            { $avg: "$ratings" },
            null,
          ],
        },
      },
    });
    if (minRating) {
      pipeline.push({ $match: { avgRating: { $gte: Number(minRating) } } });
    }
    if (sort === "distance" && useGeo) {
      pipeline.push({ $sort: { distanceMeters: 1 } });
    } else if (sort === "rating") {
      pipeline.push({ $sort: { avgRating: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }
    pipeline.push({ $limit: 100 });
    const labs = await Laboratory.aggregate(pipeline);
    res
      .status(200)
      .json({ success: true, count: labs.length, laboratories: labs });
  } catch (error) {
    console.error("Filter Laboratories Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLaboratoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const lab = await Laboratory.findById(id).populate(
      "user",
      "name email role phoneNumber createdAt",
    );
    if (!lab) {
      return res.status(404).json({ message: "Laboratory not found" });
    }
    res.status(200).json({ success: true, laboratory: lab });
  } catch (error) {
    console.error("Get Laboratory By Id Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddLaboratoryReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const lab = await Laboratory.findById(id);
    if (!lab) return res.status(404).json({ message: "Laboratory not found" });
    if (rating !== undefined) {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      lab.ratings = Array.isArray(lab.ratings) ? [...lab.ratings, r] : [r];
    }
    if (review) {
      lab.reviews = Array.isArray(lab.reviews)
        ? [...lab.reviews, String(review)]
        : [String(review)];
    }
    await lab.save();
    res.status(200).json({ success: true, laboratory: lab });
  } catch (error) {
    console.error("Add Laboratory Review Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLaboratoryProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    let lab = await Laboratory.findOne({ user: userId }).populate(
      "user",
      "name email phoneNumber role createdAt"
    );
    
    // Auto-create if profile doesn't exist
    if (!lab) {
      try {
        lab = await Laboratory.create({
          user: userId,
          labName: req.user.name || 'Laboratory',
          ownerName: req.user.name || '',
          licenseNumber: '',
          labEmail: req.user.email || '',
          labPhoneNumber: req.user.phoneNumber || '',
          address: '',
          city: '',
          location: null,
          workingHours: { start: '09:00', end: '17:00' },
          testsOffered: [],
          availableTests: [],
          homeSampleAvailable: false,
          isApproved: false,
          ratings: [],
          reviews: [],
        });
        
        // Populate user details after creation
        lab = await Laboratory.findById(lab._id).populate(
          "user",
          "name email phoneNumber role createdAt"
        );
        console.log("✅ Laboratory profile auto-created for:", userId);
      } catch (createErr) {
        console.error("Error auto-creating laboratory profile:", createErr);
        return res.status(500).json({ message: "Failed to create laboratory profile" });
      }
    }
    
    res.status(200).json({ success: true, laboratory: lab });
  } catch (error) {
    console.error("Get Laboratory Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Upload structured test results with auto-flagging
// @route   POST /api/laboratories/bookings/:id/upload-structured-results
// @access  Private (Lab)
exports.uploadStructuredResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { results, criticalAlert } = req.body;

    const booking = await LabBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user is associated with the lab
    if (booking.lab.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Auto-calculate severity for each result if not provided
    const processedResults = results.map(result => {
      const value = parseFloat(result.value);
      const referenceRange = result.referenceRange || {};
      const min = referenceRange.min;
      const max = referenceRange.max;

      let severity = 'normal';
      let isAbnormal = false;

      if (min != null && max != null) {
        if (value < min) {
          isAbnormal = true;
          const deviation = (min - value) / min;
          if (deviation > 0.5) severity = 'critical';
          else if (deviation > 0.25) severity = 'abnormal';
          else if (deviation > 0.1) severity = 'borderline';
        } else if (value > max) {
          isAbnormal = true;
          const deviation = (value - max) / max;
          if (deviation > 0.5) severity = 'critical';
          else if (deviation > 0.25) severity = 'abnormal';
          else if (deviation > 0.1) severity = 'borderline';
        }
      }

      return {
        ...result,
        severity: result.severity || severity,
        isAbnormal: result.isAbnormal !== undefined ? result.isAbnormal : isAbnormal
      };
    });

    // Update booking with structured results
    booking.results = processedResults;
    booking.criticalAlert = criticalAlert || processedResults.some(r => r.severity === 'critical');
    booking.processedAt = new Date();
    
    // If completed, set completion time
    if (booking.status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Structured results uploaded successfully',
      booking,
      hasCriticalValues: booking.criticalAlert
    });
  } catch (error) {
    console.error('Error uploading structured results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get structured results for a booking
// @route   GET /api/laboratories/bookings/:id/structured-results
// @access  Private
exports.getStructuredResults = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await LabBooking.findById(id).select('results criticalAlert processedAt');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      results: booking.results || [],
      criticalAlert: booking.criticalAlert,
      processedAt: booking.processedAt
    });
  } catch (error) {
    console.error('Error fetching structured results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient's historical results for a specific test parameter
// @route   GET /api/laboratories/results/history/:patientId/:testParameter
// @access  Private
exports.getResultHistory = async (req, res) => {
  try {
    const { patientId, testParameter } = req.params;

    // Find all completed bookings for this patient with the specific test
    const bookings = await LabBooking.find({
      patient: patientId,
      status: 'completed',
      'results.testParameter': testParameter
    })
    .select('bookingNumber testDate results processedAt doctor')
    .populate('doctor', 'name')
    .sort({ testDate: -1 })
    .limit(50);

    // Extract historical values
    const history = bookings.map(booking => {
      const result = booking.results.find(r => r.testParameter === testParameter);
      return {
        bookingNumber: booking.bookingNumber,
        testDate: booking.testDate,
        processedAt: booking.processedAt,
        value: result?.value,
        unit: result?.unit,
        severity: result?.severity,
        isAbnormal: result?.isAbnormal,
        doctorName: booking.doctor?.name
      };
    });

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Error fetching result history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get processing time metrics
// @route   GET /api/laboratories/:labId/analytics/processing-time
// @access  Private (Lab/Admin)
exports.getProcessingTimeMetrics = async (req, res) => {
  try {
    const { labId } = req.params;

    const bookings = await LabBooking.find({
      lab: labId,
      status: 'completed',
      processedAt: { $exists: true }
    }).select('createdAt processedAt');

    if (bookings.length === 0) {
      return res.status(200).json({
        success: true,
        metrics: {
          averageHours: 0,
          medianHours: 0,
          fastest: 0,
          slowest: 0,
          withinSLA: 0
        }
      });
    }

    // Calculate processing times in hours
    const processingTimes = bookings.map(booking => {
      const created = new Date(booking.createdAt);
      const processed = new Date(booking.processedAt);
      return (processed - created) / (1000 * 60 * 60); // Convert ms to hours
    });

    // Sort for median calculation
    processingTimes.sort((a, b) => a - b);

    const average = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
    const median = processingTimes.length % 2 === 0
      ? (processingTimes[processingTimes.length / 2 - 1] + processingTimes[processingTimes.length / 2]) / 2
      : processingTimes[Math.floor(processingTimes.length / 2)];

    const fastest = Math.min(...processingTimes);
    const slowest = Math.max(...processingTimes);

    // Calculate SLA compliance (assuming 48 hour SLA)
    const slaThreshold = 48;
    const withinSLA = (processingTimes.filter(t => t <= slaThreshold).length / processingTimes.length) * 100;

    res.status(200).json({
      success: true,
      metrics: {
        averageHours: parseFloat(average.toFixed(2)),
        medianHours: parseFloat(median.toFixed(2)),
        fastest: parseFloat(fastest.toFixed(2)),
        slowest: parseFloat(slowest.toFixed(2)),
        withinSLA: parseFloat(withinSLA.toFixed(2)),
        totalSamples: bookings.length
      }
    });
  } catch (error) {
    console.error('Error calculating processing time:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get quality metrics (error/rejection rates)
// @route   GET /api/laboratories/:labId/analytics/quality
// @access  Private (Lab/Admin)
exports.getQualityMetrics = async (req, res) => {
  try {
    const { labId } = req.params;

    const totalBookings = await LabBooking.countDocuments({ lab: labId });
    const rejectedBookings = await LabBooking.countDocuments({
      lab: labId,
      status: 'rejected'
    });
    const cancelledBookings = await LabBooking.countDocuments({
      lab: labId,
      status: 'cancelled'
    });

    const rejectionRate = totalBookings > 0 ? (rejectedBookings / totalBookings) * 100 : 0;
    const errorRate = totalBookings > 0 ? ((rejectedBookings + cancelledBookings) / totalBookings) * 100 : 0;

    res.status(200).json({
      success: true,
      metrics: {
        errorRate: parseFloat(errorRate.toFixed(2)),
        rejectionRate: parseFloat(rejectionRate.toFixed(2)),
        totalErrors: cancelledBookings,
        totalRejections: rejectedBookings,
        totalBookings,
        commonErrors: [] // Can be enhanced with error categorization
      }
    });
  } catch (error) {
    console.error('Error calculating quality metrics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get volume trends
// @route   GET /api/laboratories/:labId/analytics/volume
// @access  Private (Lab/Admin)
exports.getVolumeTrends = async (req, res) => {
  try {
    const { labId } = req.params;
    const { period = 'day', days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Group by date
    const trends = await LabBooking.aggregate([
      {
        $match: {
          lab: new mongoose.Types.ObjectId(labId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      trends: trends.map(t => ({
        date: t._id,
        total: t.count,
        completed: t.completed,
        pending: t.pending
      }))
    });
  } catch (error) {
    console.error('Error fetching volume trends:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get urgent cases statistics
// @route   GET /api/laboratories/:labId/analytics/urgent-cases
// @access  Private (Lab/Admin)
exports.getUrgentCasesStats = async (req, res) => {
  try {
    const { labId } = req.params;

    const urgentBookings = await LabBooking.find({
      lab: labId,
      priority: { $in: ['urgent', 'emergency'] }
    });

    const completedOnTime = urgentBookings.filter(b => {
      if (!b.completedAt || !b.createdAt) return false;
      const hours = (new Date(b.completedAt) - new Date(b.createdAt)) / (1000 * 60 * 60);
      return hours <= 24; // Completed within 24 hours
    }).length;

    const criticalAlerts = await LabBooking.countDocuments({
      lab: labId,
      criticalAlert: true
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUrgent: urgentBookings.length,
        completedOnTime,
        onTimePercentage: urgentBookings.length > 0 ? (completedOnTime / urgentBookings.length) * 100 : 0,
        criticalAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching urgent cases:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get revenue analytics
// @route   POST /api/laboratories/:labId/analytics/revenue
// @access  Private (Lab/Admin)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { labId } = req.params;
    const { startDate, endDate } = req.body;

    const matchFilter = {
      lab: new mongoose.Types.ObjectId(labId),
      status: 'completed'
    };

    if (startDate && endDate) {
      matchFilter.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await LabBooking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          totalBookings: { $sum: 1 },
          averagePerTest: { $avg: '$price' }
        }
      }
    ]);

    const result = bookings[0] || { totalRevenue: 0, totalBookings: 0, averagePerTest: 0 };

    // Calculate growth (compare with previous period)
    let previousPeriodRevenue = 0;
    if (startDate && endDate) {
      const prevStartDate = new Date(startDate);
      const daysDiff = new Date(endDate) - new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - (daysDiff / (1000 * 60 * 60 * 24)));

      const prevBookings = await LabBooking.aggregate([
        {
          $match: {
            lab: new mongoose.Types.ObjectId(labId),
            status: 'completed',
            completedAt: {
              $gte: prevStartDate,
              $lt: new Date(startDate)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$price' }
          }
        }
      ]);

      previousPeriodRevenue = prevBookings[0]?.totalRevenue || 0;
    }

    const growth = previousPeriodRevenue > 0
      ? ((result.totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0;

    res.status(200).json({
      success: true,
      revenue: {
        totalRevenue: result.totalRevenue,
        totalBookings: result.totalBookings,
        averagePerTest: parseFloat(result.averagePerTest.toFixed(2)),
        growth: parseFloat(growth.toFixed(2)),
        previousPeriodRevenue
      }
    });
  } catch (error) {
    console.error('Error calculating revenue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get peak hours analysis
// @route   GET /api/laboratories/:labId/analytics/peak-hours
// @access  Private (Lab/Admin)
exports.getPeakHoursAnalysis = async (req, res) => {
  try {
    const { labId } = req.params;

    const bookings = await LabBooking.find({
      lab: labId
    }).select('createdAt');

    if (bookings.length === 0) {
      return res.status(200).json({
        success: true,
        analysis: {
          busiestDay: 'N/A',
          busiestHour: 0,
          quietestDay: 'N/A',
          hourlyDistribution: {}
        }
      });
    }

    // Analyze by day of week
    const dayCounts = {};
    const hourCounts = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    bookings.forEach(booking => {
      const date = new Date(booking.createdAt);
      const dayName = days[date.getDay()];
      const hour = date.getHours();

      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find busiest and quietest days
    const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0];
    const quietestDay = Object.entries(dayCounts).sort((a, b) => a[1] - b[1])[0][0];

    // Find busiest hour
    const busiestHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0]);

    res.status(200).json({
      success: true,
      analysis: {
        busiestDay,
        busiestHour,
        quietestDay,
        hourlyDistribution: hourCounts,
        dailyDistribution: dayCounts
      }
    });
  } catch (error) {
    console.error('Error analyzing peak hours:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get comparative analytics
// @route   POST /api/laboratories/:labId/analytics/comparative
// @access  Private (Lab/Admin)
exports.getComparativeAnalytics = async (req, res) => {
  try {
    const { labId } = req.params;
    const { comparisonType, startDate, endDate } = req.body;

    let currentPeriodFilter = { lab: labId };
    let previousPeriodFilter = { lab: labId };

    if (comparisonType === 'period' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);

      currentPeriodFilter.createdAt = { $gte: start, $lte: end };

      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - daysDiff);
      previousPeriodFilter.createdAt = { $gte: prevStart, $lt: start };
    }

    const [currentStats, previousStats] = await Promise.all([
      LabBooking.countDocuments(currentPeriodFilter),
      LabBooking.countDocuments(previousPeriodFilter)
    ]);

    const change = previousStats > 0
      ? ((currentStats - previousStats) / previousStats) * 100
      : 0;

    res.status(200).json({
      success: true,
      comparison: {
        currentPeriod: currentStats,
        previousPeriod: previousStats,
        change: parseFloat(change.toFixed(2)),
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      }
    });
  } catch (error) {
    console.error('Error calculating comparative analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
