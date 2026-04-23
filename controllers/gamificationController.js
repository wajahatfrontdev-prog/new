const Patient = require("../models/patient");
const MedicalRecord = require("../models/medicalRecord");
const Appointment = require("../models/appointment");
const LabBooking = require("../models/labBooking");

// Badge definitions
const BADGES = {
  FIRST_APPOINTMENT: {
    name: "First Step",
    icon: "🏥",
    description: "Completed your first appointment",
    points: 50
  },
  HEALTH_CONSCIOUS: {
    name: "Health Conscious",
    icon: "💚",
    description: "Completed 5 appointments",
    points: 100
  },
  REGULAR_VISITOR: {
    name: "Regular Visitor",
    icon: "⭐",
    description: "Completed 10 appointments",
    points: 200
  },
  LAB_WARRIOR: {
    name: "Lab Warrior",
    icon: "🔬",
    description: "Completed 5 lab tests",
    points: 100
  },
  MEDICATION_MASTER: {
    name: "Medication Master",
    icon: "💊",
    description: "Followed 3 prescriptions",
    points: 75
  },
  LEARNING_ENTHUSIAST: {
    name: "Learning Enthusiast",
    icon: "📚",
    description: "Completed 3 health programs",
    points: 150
  },
  WELLNESS_CHAMPION: {
    name: "Wellness Champion",
    icon: "🏆",
    description: "Reached 500 points",
    points: 0
  },
  HEALTH_HERO: {
    name: "Health Hero",
    icon: "🦸",
    description: "Reached 1000 points",
    points: 0
  },
  PERFECT_LAB: {
    name: "Perfect Lab Results",
    icon: "✨",
    description: "All lab results in normal range",
    points: 50
  },
  REGULAR_CHECKUP: {
    name: "Regular Checkup Champion",
    icon: "📅",
    description: "Completed lab tests 3 months in a row",
    points: 75
  },
  HEALTH_IMPROVER: {
    name: "Health Improver",
    icon: "📈",
    description: "Improved abnormal lab results to normal",
    points: 100
  }
};

// Award badge to patient
async function awardBadge(patientId, badgeKey) {
  try {
    const patient = await Patient.findOne({ user: patientId });
    if (!patient) return;

    const badge = BADGES[badgeKey];
    if (!badge) return;

    // Check if badge already awarded
    const hasBadge = patient.badges.some(b => b.name === badge.name);
    if (hasBadge) return;

    // Award badge
    patient.badges.push({
      name: badge.name,
      icon: badge.icon,
      earnedAt: new Date()
    });

    // Award points if applicable
    if (badge.points > 0) {
      patient.points += badge.points;
    }

    await patient.save();
    console.log(`✅ Badge awarded: ${badge.name} to patient ${patientId}`);
    
    return badge;
  } catch (error) {
    console.error("Error awarding badge:", error);
  }
}

// Check and award badges based on patient activity
async function checkAndAwardBadges(patientId) {
  try {
    const patient = await Patient.findOne({ user: patientId });
    if (!patient) return [];

    const newBadges = [];

    // Count completed appointments
    const completedAppointments = await Appointment.countDocuments({
      patient: patientId,
      status: "completed"
    });

    if (completedAppointments >= 1 && !patient.badges.some(b => b.name === BADGES.FIRST_APPOINTMENT.name)) {
      const badge = await awardBadge(patientId, "FIRST_APPOINTMENT");
      if (badge) newBadges.push(badge);
    }

    if (completedAppointments >= 5 && !patient.badges.some(b => b.name === BADGES.HEALTH_CONSCIOUS.name)) {
      const badge = await awardBadge(patientId, "HEALTH_CONSCIOUS");
      if (badge) newBadges.push(badge);
    }

    if (completedAppointments >= 10 && !patient.badges.some(b => b.name === BADGES.REGULAR_VISITOR.name)) {
      const badge = await awardBadge(patientId, "REGULAR_VISITOR");
      if (badge) newBadges.push(badge);
    }

    // Count completed lab tests
    const completedLabTests = await LabBooking.countDocuments({
      patient: patientId,
      status: "completed"
    });

    if (completedLabTests >= 5 && !patient.badges.some(b => b.name === BADGES.LAB_WARRIOR.name)) {
      const badge = await awardBadge(patientId, "LAB_WARRIOR");
      if (badge) newBadges.push(badge);
    }

    // Check for perfect lab results
    const recentBookings = await LabBooking.find({
      patient: patientId,
      status: 'completed',
      results: { $exists: true, $ne: [] }
    }).limit(5);

    let allNormal = recentBookings.length > 0;
    recentBookings.forEach(booking => {
      booking.results.forEach(result => {
        if (result.severity !== 'normal') {
          allNormal = false;
        }
      });
    });

    if (allNormal && recentBookings.length >= 3 && !patient.badges.some(b => b.name === BADGES.PERFECT_LAB.name)) {
      const badge = await awardBadge(patientId, "PERFECT_LAB");
      if (badge) newBadges.push(badge);
    }

    // Check for regular checkups (tests in consecutive months)
    if (recentBookings.length >= 3) {
      const months = new Set();
      recentBookings.forEach(booking => {
        const date = new Date(booking.testDate || booking.createdAt);
        months.add(`${date.getFullYear()}-${date.getMonth()}`);
      });

      if (months.size >= 3 && !patient.badges.some(b => b.name === BADGES.REGULAR_CHECKUP.name)) {
        const badge = await awardBadge(patientId, "REGULAR_CHECKUP");
        if (badge) newBadges.push(badge);
      }
    }

    // Count medical records with prescriptions
    const recordsWithPrescriptions = await MedicalRecord.countDocuments({
      patient: patientId,
      "prescription.medicines": { $exists: true, $ne: [] }
    });

    if (recordsWithPrescriptions >= 3 && !patient.badges.some(b => b.name === BADGES.MEDICATION_MASTER.name)) {
      const badge = await awardBadge(patientId, "MEDICATION_MASTER");
      if (badge) newBadges.push(badge);
    }

    // Count completed health programs
    const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
    const completedPrograms = await StudentCourseEnrollment.countDocuments({
      user: patientId,
      status: "completed"
    });

    if (completedPrograms >= 3 && !patient.badges.some(b => b.name === BADGES.LEARNING_ENTHUSIAST.name)) {
      const badge = await awardBadge(patientId, "LEARNING_ENTHUSIAST");
      if (badge) newBadges.push(badge);
    }

    // Points-based badges
    const updatedPatient = await Patient.findOne({ user: patientId });
    if (updatedPatient.points >= 500 && !updatedPatient.badges.some(b => b.name === BADGES.WELLNESS_CHAMPION.name)) {
      const badge = await awardBadge(patientId, "WELLNESS_CHAMPION");
      if (badge) newBadges.push(badge);
    }

    if (updatedPatient.points >= 1000 && !updatedPatient.badges.some(b => b.name === BADGES.HEALTH_HERO.name)) {
      const badge = await awardBadge(patientId, "HEALTH_HERO");
      if (badge) newBadges.push(badge);
    }

    return newBadges;
  } catch (error) {
    console.error("Error checking badges:", error);
    return [];
  }
}

// Get patient stats
exports.getMyStats = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // Check and award new badges
    const newBadges = await checkAndAwardBadges(patientId);

    // Get updated patient data
    const updatedPatient = await Patient.findOne({ user: patientId });

    // Calculate stats
    const completedAppointments = await Appointment.countDocuments({
      patient: patientId,
      status: "completed"
    });

    const completedLabTests = await LabBooking.countDocuments({
      patient: patientId,
      status: "completed"
    });

    const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
    const completedPrograms = await StudentCourseEnrollment.countDocuments({
      user: patientId,
      status: "completed"
    });

    res.status(200).json({
      success: true,
      points: updatedPatient.points,
      badges: updatedPatient.badges,
      newBadges,
      stats: {
        completedAppointments,
        completedLabTests,
        completedPrograms,
        totalBadges: updatedPatient.badges.length
      },
      availableBadges: Object.values(BADGES).map(b => ({
        name: b.name,
        icon: b.icon,
        description: b.description,
        earned: updatedPatient.badges.some(badge => badge.name === b.name)
      }))
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Award points manually
exports.awardPoints = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: "Invalid points value" });
    }

    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    patient.points += points;
    await patient.save();

    // Check for new badges
    await checkAndAwardBadges(patientId);

    res.status(200).json({
      success: true,
      message: `${points} points awarded${reason ? ` for ${reason}` : ''}`,
      totalPoints: patient.points
    });
  } catch (error) {
    console.error("Award Points Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const topPatients = await Patient.find()
      .populate("user", "name")
      .sort({ points: -1 })
      .limit(10)
      .select("user points badges");

    const leaderboard = topPatients.map((p, index) => ({
      rank: index + 1,
      name: p.user?.name || "Anonymous",
      points: p.points,
      badgeCount: p.badges.length
    }));

    res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error("Get Leaderboard Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMyStats: exports.getMyStats,
  awardPoints: exports.awardPoints,
  getLeaderboard: exports.getLeaderboard,
  checkAndAwardBadges,
  awardBadge,
};
