const LabBooking = require("../models/labBooking");
const Laboratory = require("../models/laboratory");

const makeBookingNumber = () => {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LAB-${Date.now().toString().slice(-6)}-${part}`;
};

exports.createBooking = async (req, res) => {
  try {
    const { labId } = req.params;
    const {
      testName,
      contactName,
      contactPhone,
      contactLocation,
      age,
      date,
      time,
      homeSample,
      price,
      totalAmount,
      prescription
    } = req.body;
    const patientId = req.user._id;
    const lab = await Laboratory.findById(labId);
    if (!lab) return res.status(404).json({ message: "Laboratory not found" });

    const booking = await LabBooking.create({
      laboratory: labId,
      patient: patientId,
      testName,
      contactName,
      contactPhone,
      contactLocation,
      age,
      date,
      time,
      homeSample: !!homeSample,
      price: price || totalAmount || 0,
      prescription: prescription || null,
      bookingNumber: makeBookingNumber(),
    });

    const full = await LabBooking.findById(booking._id)
      .populate("laboratory", "labName city labPhoneNumber labEmail")
      .populate("patient", "name email");

    res.status(201).json({
      success: true,
      message: "Booking created",
      booking: full,
      receipt: {
        bookingNumber: full.bookingNumber,
        lab: full.laboratory,
        testName: full.testName,
        date: full.date,
        time: full.time,
        patient: full.patient,
        homeSample: full.homeSample,
      },
    });
  } catch (error) {
    console.error("Create Lab Booking Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await LabBooking.find({ patient: userId })
      .populate("laboratory", "labName city")
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Get My Lab Bookings Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLabBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { labId } = req.params;
    const lab = await Laboratory.findById(labId);
    if (!lab) return res.status(404).json({ message: "Laboratory not found" });
    if (lab.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view lab bookings" });
    }
    const { status } = req.query;
    const filter = { laboratory: labId };
    if (status) {
      if (status === "upcoming") {
        const now = new Date();
        filter.date = { $gte: now };
        filter.status = { $in: ["pending", "confirmed"] };
      } else {
        filter.status = status;
      }
    }
    const bookings = await LabBooking.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("medicalRecord")
      .sort({ date: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Get Lab Bookings Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const booking = await LabBooking.findById(id)
      .populate("laboratory", "labName city user")
      .populate("patient", "name email")
      .populate("doctor", "name email");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const isParticipant =
      booking.patient.toString() === userId.toString() ||
      booking.laboratory.user?.toString?.() === userId.toString();
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Get Booking By Id Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const {
      testName,
      contactName,
      contactPhone,
      contactLocation,
      age,
      date,
      time,
      homeSample,
      status,
      prescription,
      resultNotes,
      reportUrl,
      isAbnormal,
      flagReason
    } = req.body;
    const booking = await LabBooking.findById(id).populate(
      "laboratory",
      "user",
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const isLab = booking.laboratory.user.toString() === userId.toString();
    const isPatient = booking.patient.toString() === userId.toString();
    if (!isLab && !isPatient)
      return res.status(403).json({ message: "Not authorized" });

    const update = {};
    if (testName !== undefined) update.testName = testName;
    if (contactName !== undefined) update.contactName = contactName;
    if (contactPhone !== undefined) update.contactPhone = contactPhone;
    if (contactLocation !== undefined) update.contactLocation = contactLocation;
    if (age !== undefined) update.age = age;
    if (date !== undefined) update.date = date;
    if (time !== undefined) update.time = time;
    if (homeSample !== undefined) update.homeSample = homeSample;
    if (prescription !== undefined) update.prescription = prescription;
    if (resultNotes !== undefined) update.resultNotes = resultNotes;
    if (reportUrl !== undefined) update.reportUrl = reportUrl;
    if (isAbnormal !== undefined) update.isAbnormal = isAbnormal;
    if (flagReason !== undefined) update.flagReason = flagReason;
    if (status !== undefined) {
      if (isLab) {
        update.status = status;
      } else if (isPatient && status === "cancelled") {
        update.status = status;
      } else {
        return res
          .status(403)
          .json({ message: "Not allowed to set this status" });
      }
    }
    const updated = await LabBooking.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    // If completed, award points and notify referring doctor
    if (updated && updated.status === "completed") {
      // Award points for lab completion
      try {
        const Patient = require("../models/patient");
        await Patient.findOneAndUpdate(
          { user: updated.patient },
          {
            $inc: { points: 30 },
            $addToSet: { badges: { name: "Proactive Patient", icon: "science" } }
          }
        );
        console.log(`✅ 30 points awarded to user ${updated.patient} for lab test completion`);
      } catch (awardErr) {
        console.error("❌ Failed to award points for lab completion:", awardErr);
      }

      if (updated.medicalRecord) {
        try {
          const MedicalRecord = require("../models/medicalRecord");
          const Notification = require("../models/notification");
          const record = await MedicalRecord.findById(updated.medicalRecord);
          if (record && record.doctor) {
            await Notification.create({
              recipient: record.doctor,
              sender: updated.laboratory,
              type: "progress",
              title: "Lab Results Ready",
              message: `Laboratory results for ${updated.testName} are now available for your patient.`,
              relatedId: record._id,
              onModel: "MedicalRecord"
            });
            console.log("✅ Referring doctor notified of lab results");
          }
        } catch (err) {
          console.error("Error notifying doctor of lab results:", err);
        }
      }
    }

    res.status(200).json({ success: true, booking: updated });
  } catch (error) {
    console.error("Update Lab Booking Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const booking = await LabBooking.findById(id).populate(
      "laboratory",
      "user",
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const isLab = booking.laboratory.user.toString() === userId.toString();
    const isPatient = booking.patient.toString() === userId.toString();
    if (!isLab && !isPatient)
      return res.status(403).json({ message: "Not authorized" });
    const cancelledBy = isLab ? "Laboratory" : "Patient";
    const updated = await LabBooking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "cancelled",
          cancellationReason: reason || null,
          cancelledBy,
          cancelledAt: new Date(),
        },
      },
      { new: true },
    );
    res.status(200).json({ success: true, booking: updated });
  } catch (error) {
    console.error("Cancel Lab Booking Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const booking = await LabBooking.findById(id).populate(
      "laboratory",
      "user",
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const isLab = booking.laboratory.user.toString() === userId.toString();
    const isPatient = booking.patient.toString() === userId.toString();
    if (!isLab && !isPatient)
      return res.status(403).json({ message: "Not authorized" });
    await LabBooking.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.error("Delete Lab Booking Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
