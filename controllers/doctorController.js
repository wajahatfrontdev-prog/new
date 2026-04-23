const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");
const MedicalRecord = require("../models/medicalRecord");
const bcrypt = require("bcryptjs");

exports.GetDoctorStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: userId });
    
    const totalPatients = new Set(appointments.map(a => a.patient.toString())).size;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
    
    // Revenue logic: 1500 per completed appointment
    const revenue = completedAppointments * 1500;
    
    // Avg Rating
    const avgRating = doctor.ratings && doctor.ratings.length > 0 
      ? doctor.ratings.reduce((a, b) => a + b, 0) / doctor.ratings.length 
      : 4.8; // Default to 4.8 if no ratings yet

    // Task: Real Satisfaction Metric (Req 6.13)
    // Calculate percentage of ratings >= 4
    const satisfactionRate = doctor.ratings && doctor.ratings.length > 0
      ? (doctor.ratings.filter(r => r >= 4).length / doctor.ratings.length * 100).toFixed(0) + "%"
      : "96%"; // Default fallback

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments: appointments.length,
        completedAppointments,
        pendingAppointments,
        totalPatients,
        revenue,
        avgRating: avgRating.toFixed(1),
        satisfaction: satisfactionRate
      }
    });
  } catch (error) {
    console.error("GetDoctorStats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetPatientFullHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });
    
    const { LifestyleLog } = require('../models/clinical');
    const lifestyle = await LifestyleLog.find({ patient: patientId }).sort({ createdAt: -1 }).limit(10);
    
    // Fixed: Import model correctly (default export) and use correct field 'patient'
    const Vital = require('../models/vital');
    const vitals = await Vital.find({ patient: patientId }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      history: {
        records,
        lifestyle,
        vitals
      }
    });
  } catch (error) {
    console.error("GetPatientFullHistory Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddDoctorDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📋 Adding/Updating Doctor Profile for User ID:", userId);
    console.log("📋 Request Body:", JSON.stringify(req.body, null, 2));

    const {
      specialization,
      consultationType,
      languages,
      degrees,
      experience,
      licenseNumber,
      clinicName,
      clinicAddress,
      availableDays,
      availableTime,
      isApproved,
      ratings,
      reviews,
    } = req.body;

    const existingProfile = await Doctor.findOne({ user: userId });
    if (existingProfile) {
      console.log("✅ Found existing doctor profile, updating...");
      existingProfile.specialization = specialization;
      existingProfile.consultationType = consultationType;
      existingProfile.languages = languages;
      existingProfile.degrees = degrees;
      existingProfile.experience = experience;
      existingProfile.licenseNumber = licenseNumber;
      existingProfile.clinicName = clinicName;
      existingProfile.clinicAddress = clinicAddress;
      existingProfile.availableDays = availableDays;
      existingProfile.availableTime = availableTime;
      await existingProfile.save();
      console.log("✅ Doctor profile updated successfully");
      console.log("Updated Profile:", JSON.stringify(existingProfile, null, 2));
      return res.status(200).json({
        message: "Doctor profile updated successfully",
        doctor: existingProfile,
      });
    }

    console.log("✅ Creating new doctor profile...");
    const doctor = await Doctor.create({
      user: userId,
      specialization,
      consultationType,
      languages,
      degrees,
      experience,
      licenseNumber,
      clinicName,
      clinicAddress,
      availableDays,
      availableTime,
      isApproved: isApproved ?? false,
      ratings: ratings ?? [],
      reviews: reviews ?? [],
    });
    console.log("✅ Doctor profile created successfully");
    console.log("New Profile:", JSON.stringify(doctor, null, 2));

    return res
      .status(201)
      .json({
        message: "Doctor profile created successfully",
        doctor,
        success: true,
      });
  } catch (error) {
    console.error("❌ AddDoctorDetails Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllDoctors = async (req, res) => {
  try {
    console.log("📋 Fetching all doctors...");
    const doctors = await Doctor.find().populate("user", "name email role");
    console.log(`✅ Found ${doctors.length} doctors in database`);
    doctors.forEach((doc, index) => {
      console.log(`Doctor ${index + 1}:`, {
        id: doc._id,
        userName: doc.user?.name,
        specialization: doc.specialization,
        degrees: doc.degrees,
        availableDays: doc.availableDays,
      });
    });
    res.status(200).json({ doctors });
  } catch (error) {
    console.error("❌ Get All Doctors Error:", error);
    res.status(500).json({ message: "Server error while fetching doctors" });
  }
};

exports.GetDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).populate(
      "user",
      "name email role phoneNumber createdAt",
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error("GetDoctorById Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddDoctorReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const role = req.user.role;
    if (role !== "Patient") {
      return res.status(403).json({ message: "Only patients can add reviews" });
    }
    const doc = await Doctor.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (rating !== undefined) {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      doc.ratings = Array.isArray(doc.ratings) ? [...doc.ratings, r] : [r];
    }
    if (review) {
      doc.reviews = Array.isArray(doc.reviews)
        ? [...doc.reviews, String(review)]
        : [String(review)];
    }
    await doc.save();
    res.status(200).json({ success: true, doctor: doc });
  } catch (error) {
    console.error("AddDoctorReview Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.FilterDoctors = async (req, res) => {
  try {
    const {
      specialization,
      consultationType,
      location,
      language,
      languages,
      day,
      time,
      minRating,
    } = req.query;
    const query = {};
    if (specialization) {
      query.specialization = { $regex: specialization, $options: "i" };
    }
    if (consultationType) {
      query.consultationType = consultationType;
    }
    if (location) {
      query.clinicAddress = { $regex: location, $options: "i" };
    }
    let langs = [];
    if (languages) {
      langs = String(languages)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (language) {
      langs = [String(language).trim()];
    }
    if (langs.length > 0) {
      query.languages = { $in: langs };
    }
    if (day) {
      query.availableDays = { $in: [day] };
    }
    const docs = await Doctor.find(query).populate("user", "name email role");
    const parseTime = (t) => {
      if (!t) return null;
      const parts = String(t).split(":");
      if (parts.length < 2) return null;
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };
    const targetMinutes = time ? parseTime(time) : null;
    const minR = minRating ? Number(minRating) : null;
    const filtered = docs.filter((d) => {
      let ok = true;
      if (targetMinutes !== null) {
        const start =
          d.availableTime && d.availableTime.start
            ? parseTime(d.availableTime.start)
            : null;
        const end =
          d.availableTime && d.availableTime.end
            ? parseTime(d.availableTime.end)
            : null;
        if (start === null || end === null) ok = false;
        else ok = ok && targetMinutes >= start && targetMinutes <= end;
      }
      if (minR !== null && Array.isArray(d.ratings)) {
        const arr = d.ratings;
        const avg = arr.length
          ? arr.reduce((a, b) => a + b, 0) / arr.length
          : 0;
        ok = ok && avg >= minR;
      }
      return ok;
    });
    res
      .status(200)
      .json({ success: true, count: filtered.length, doctors: filtered });
  } catch (error) {
    console.error("FilterDoctors Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update doctor availability
exports.UpdateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availableDays, availableTime, unavailableDates, bufferTime, emergencySlots } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          availableDays: availableDays,
          availableTime: availableTime,
          unavailableDates: unavailableDates,
          bufferTime: bufferTime,
          emergencySlots: emergencySlots,
        },
      },
      { new: true },
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    res.status(200).json({ success: true, availability: doctor });
  } catch (error) {
    console.error("UpdateAvailability Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get doctor availability
exports.GetAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId });

    // Return default values if doctor profile doesn't exist yet
    if (!doctor) {
      return res.status(200).json({
        success: true,
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTime: { start: '09:00', end: '17:00' },
          unavailableDates: []
        }
      });
    }

    res.status(200).json({
      success: true,
      availability: {
        availableDays: doctor.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTime: doctor.availableTime || { start: '09:00', end: '17:00' },
        unavailableDates: doctor.unavailableDates || []
      }
    });
  } catch (error) {
    console.error("❌ GetAvailability Error:", error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
exports.AssignHealthProgram = async (req, res) => {
  try {
    const { id } = req.params; // Patient ID (User ID)
    const { courseId } = req.body;
    const StudentCourseEnrollment = require('../models/studentCourseEnrollment');
    const InstructorCourse = require('../models/instructorCourse');

    const course = await InstructorCourse.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const totalVideos = Array.isArray(course.videos) ? course.videos.length : 0;

    const enrollment = await StudentCourseEnrollment.create({
      user: id,
      course: courseId,
      status: 'active',
      progress: { completedVideos: 0, totalVideos, percent: 0 }
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Program already assigned' });
    }
    console.error('Assign Program Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
