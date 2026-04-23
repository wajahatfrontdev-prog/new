const MedicalRecord = require("../models/medicalRecord");
const User = require("../models/user");

exports.createMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const {
      patientId,
      appointmentId,
      diagnosis,
      symptoms,
      prescription,
      labTests,
      vitalSigns,
      notes,
      followUpDate,
      assignedCourses,
      referredLaboratory,
      selectedPharmacy,
    } = req.body;

    console.log("📋 Creating medical record for patient:", patientId);

    // Task 26.13: Drug Interaction Check (Simulated)
    let interactionWarning = null;
    if (prescription && prescription.medicines && prescription.medicines.length > 1) {
      const names = prescription.medicines.map(m => m.name.toLowerCase());
      // Example: Warfarin and Aspirin interaction
      if (names.includes('warfarin') && names.includes('aspirin')) {
        interactionWarning = "CRITICAL: Potential drug interaction detected between Warfarin and Aspirin. Increased risk of bleeding.";
      } else if (names.includes('amoxicillin') && names.includes('methotrexate')) {
        interactionWarning = "WARNING: Amoxicillin can increase the level of Methotrexate. Monitor for toxicity.";
      }
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId,
      diagnosis,
      symptoms,
      prescription,
      labTests,
      vitalSigns,
      notes,
      followUpDate,
      assignedCourses,
      referredLaboratory,
      selectedPharmacy,
      interactionWarning // Added field to store warning
    });

    // Auto-create Lab Booking if laboratory is referred
    if (referredLaboratory && labTests && labTests.length > 0) {
      const LabBooking = require("../models/labBooking");
      const Notification = require("../models/notification");
      const Laboratory = require("../models/laboratory");
      
      const makeBookingNumber = () => {
        const part = Math.random().toString(36).slice(2, 8).toUpperCase();
        return `LAB-REF-${Date.now().toString().slice(-6)}-${part}`;
      };

      const labBooking = await LabBooking.create({
        laboratory: referredLaboratory,
        patient: patientId,
        testName: Array.isArray(labTests) ? labTests.join(", ") : "Ordered Lab Tests",
        medicalRecord: record._id,
        bookingNumber: makeBookingNumber(),
        status: "pending",
        doctor: doctorId,
        date: new Date(),
        price: 0,
        urgency: req.body.urgency || 'Normal',
        diagnosisNotes: diagnosis,
        specialInstructions: req.body.labInstructions || notes
      });

      // Notify Laboratory
      const lab = await Laboratory.findById(referredLaboratory);
      if (lab && lab.user) {
        await Notification.create({
          user: lab.user,
          title: "New Lab Test Order from Doctor",
          message: `Dr. ${req.user.name} has ordered lab tests: ${labBooking.testName}`,
          type: "lab_order",
          relatedId: labBooking._id,
          relatedModel: "LabBooking"
        });
      }

      // Notify Patient
      await Notification.create({
        user: patientId,
        title: "Lab Tests Ordered",
        message: `Your doctor has ordered lab tests: ${labBooking.testName}. Please visit ${lab?.labName || 'the laboratory'} to complete them.`,
        type: "lab_order",
        relatedId: labBooking._id,
        relatedModel: "LabBooking"
      });

      console.log("✅ Lab referral booking created with notifications");
    }

    // Auto-create Pharmacy Order if pharmacy is selected
    if (selectedPharmacy && prescription && prescription.medicines && prescription.medicines.length > 0) {
      const PharmacyOrder = require("../models/pharmacyOrder");
      const Notification = require("../models/notification");
      const Pharmacy = require("../models/pharmacy");
      
      const makeOrderNumber = () => {
        const part = Math.random().toString(36).slice(2, 8).toUpperCase();
        return `PH-REF-${Date.now().toString().slice(-6)}-${part}`;
      };

      const prescriptionStr = prescription.medicines
        .map(m => `${m.name} (${m.dosage}) - ${m.frequency}`)
        .join(", ");

      const pharmacyOrder = await PharmacyOrder.create({
        pharmacy: selectedPharmacy,
        user: patientId,
        medicalRecord: record._id,
        prescriptionText: prescriptionStr,
        orderNumber: makeOrderNumber(),
        status: "pending"
      });

      // Notify Pharmacy
      const pharm = await Pharmacy.findById(selectedPharmacy);
      if (pharm && pharm.user) {
        await Notification.create({
          user: pharm.user,
          title: "New Prescription Order from Doctor",
          message: `Dr. ${req.user.name} has sent a prescription order: ${prescriptionStr.substring(0, 100)}...`,
          type: "pharmacy_order",
          relatedId: pharmacyOrder._id,
          relatedModel: "PharmacyOrder"
        });
      }

      // Notify Patient
      await Notification.create({
        user: patientId,
        title: "Prescription Sent to Pharmacy",
        message: `Your prescription has been sent to ${pharm?.pharmacyName || 'the pharmacy'} for fulfillment.`,
        type: "pharmacy_order",
        relatedId: pharmacyOrder._id,
        relatedModel: "PharmacyOrder"
      });

      console.log("✅ Pharmacy referral order created with notifications");
    }

    // Auto-enroll patient into assigned courses
    if (assignedCourses && assignedCourses.length > 0) {
      const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
      const InstructorCourse = require("../models/instructorCourse");

      for (const courseId of assignedCourses) {
        try {
          const course = await InstructorCourse.findById(courseId);
          if (course) {
            const totalVideos = Array.isArray(course.videos) ? course.videos.length : 0;
            // Check if already enrolled to avoid duplicates
            const existingEnrollment = await StudentCourseEnrollment.findOne({ user: patientId, course: courseId });

            if (!existingEnrollment) {
              await StudentCourseEnrollment.create({
                user: patientId,
                course: courseId,
                status: totalVideos === 0 ? 'completed' : 'active',
                progress: { completedVideos: 0, totalVideos, percent: totalVideos ? 0 : 100 }
              });
              console.log(`✅ Patient auto-enrolled in Health Program: ${course.title}`);
            }
          }
        } catch (enrollErr) {
          console.error(`❌ Auto-enrollment failed for course ${courseId}:`, enrollErr);
        }
      }
    }

    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate("patient", "name email phoneNumber")
      .populate("doctor", "name email")
      .populate("assignedCourses", "title thumbnail category");

    // Award points for consultation
    const Patient = require("../models/patient");
    await Patient.findOneAndUpdate(
      { user: patientId },
      { $inc: { points: 50 } }
    );

    // Check and award badges
    const { checkAndAwardBadges } = require("./gamificationController");
    await checkAndAwardBadges(patientId);

    console.log("✅ Medical record created, 50 points awarded, and badges checked");

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      record: populatedRecord,
    });
  } catch (error) {
    console.error("❌ Create Medical Record Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log("📋 Fetching medical records for patient:", patientId);

    const records = await MedicalRecord.find({ patient: patientId })
      .populate("doctor", "name email")
      .populate("appointment", "date timeSlot")
      .populate("assignedCourses", "title thumbnail category")
      .sort({ createdAt: -1 })
      .lean();

    const LabBooking = require("../models/labBooking");
    const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
    const { IntakeNotes, SoapNotes } = require("../models/clinical");
    
    for (let record of records) {
      const bookings = await LabBooking.find({ medicalRecord: record._id, reportUrl: { $ne: null } });
      record.labReportUrls = bookings.map(b => ({ testName: b.testName, url: b.reportUrl, bookingNumber: b.bookingNumber }));

      // Include SOAP and Intake Notes
      if (record.appointment) {
        const intakeNotes = await IntakeNotes.findOne({ appointment: record.appointment._id }).lean();
        const soapNotes = await SoapNotes.findOne({ appointment: record.appointment._id }).lean();
        
        if (intakeNotes) {
          record.intakeNotes = intakeNotes;
        }
        if (soapNotes) {
          record.soapNotes = soapNotes;
        }
      }

      if (record.assignedCourses && record.assignedCourses.length > 0) {
        for (let course of record.assignedCourses) {
          const patientId = record.patient && record.patient._id ? record.patient._id : record.patient;
          const enrollment = await StudentCourseEnrollment.findOne({ user: patientId, course: course._id });
          if (enrollment && enrollment.progress) {
            course.progressPercent = enrollment.progress.percent;
            course.completedVideos = enrollment.progress.completedVideos;
            course.totalVideos = enrollment.progress.totalVideos;
          }
        }
      }
    }

    console.log(`✅ Found ${records.length} medical records`);

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("❌ Get Patient Records Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyRecords = async (req, res) => {
  try {
    const patientId = req.user.id;

    console.log("📋 Patient fetching their own records:", patientId);

    const records = await MedicalRecord.find({ patient: patientId })
      .populate("patient", "name email phoneNumber")
      .populate("doctor", "name email")
      .populate("appointment", "date timeSlot")
      .populate("assignedCourses", "title thumbnail category")
      .sort({ createdAt: -1 })
      .lean();

    const LabBooking = require("../models/labBooking");
    const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
    const { IntakeNotes, SoapNotes } = require("../models/clinical");
    
    for (let record of records) {
      const bookings = await LabBooking.find({ medicalRecord: record._id, reportUrl: { $ne: null } });
      record.labReportUrls = bookings.map(b => ({ testName: b.testName, url: b.reportUrl, bookingNumber: b.bookingNumber }));

      // CRITICAL FIX: Include SOAP and Intake Notes for patient visibility
      if (record.appointment) {
        const intakeNotes = await IntakeNotes.findOne({ appointment: record.appointment._id }).lean();
        const soapNotes = await SoapNotes.findOne({ appointment: record.appointment._id }).lean();
        
        if (intakeNotes) {
          record.intakeNotes = intakeNotes;
        }
        if (soapNotes) {
          record.soapNotes = soapNotes;
        }
      }

      if (record.assignedCourses && record.assignedCourses.length > 0) {
        for (let course of record.assignedCourses) {
          const pId = record.patient && record.patient._id ? record.patient._id : record.patient;
          const enrollment = await StudentCourseEnrollment.findOne({ user: pId, course: course._id });
          if (enrollment && enrollment.progress) {
            course.progressPercent = enrollment.progress.percent;
            course.completedVideos = enrollment.progress.completedVideos;
            course.totalVideos = enrollment.progress.totalVideos;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("❌ Get My Records Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDoctorRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;

    console.log("📋 Fetching medical records for doctor:", doctorId);

    const records = await MedicalRecord.find({ doctor: doctorId })
      .populate("patient", "name email phoneNumber")
      .populate("doctor", "name email")
      .populate("appointment", "date timeSlot")
      .populate("assignedCourses", "title thumbnail category")
      .sort({ createdAt: -1 })
      .lean();

    const LabBooking = require("../models/labBooking");
    const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
    for (let record of records) {
      const bookings = await LabBooking.find({ medicalRecord: record._id, reportUrl: { $ne: null } });
      record.labReportUrls = bookings.map(b => ({ testName: b.testName, url: b.reportUrl, bookingNumber: b.bookingNumber }));

      if (record.assignedCourses && record.assignedCourses.length > 0) {
        for (let course of record.assignedCourses) {
          const pId = record.patient && record.patient._id ? record.patient._id : record.patient;
          const enrollment = await StudentCourseEnrollment.findOne({ user: pId, course: course._id });
          if (enrollment && enrollment.progress) {
            course.progressPercent = enrollment.progress.percent;
            course.completedVideos = enrollment.progress.completedVideos;
            course.totalVideos = enrollment.progress.totalVideos;
          }
        }
      }
    }

    console.log(`✅ Found ${records.length} medical records`);

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("❌ Get Doctor Records Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const doctorId = req.user.id;

    console.log("📋 Updating medical record:", recordId);

    const record = await MedicalRecord.findOne({
      _id: recordId,
      doctor: doctorId,
    });

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    Object.assign(record, req.body);
    record.updatedAt = Date.now();
    await record.save();

    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate("patient", "name email phoneNumber")
      .populate("doctor", "name email");

    console.log("✅ Medical record updated successfully");

    res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      record: populatedRecord,
    });
  } catch (error) {
    console.error("❌ Update Medical Record Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await MedicalRecord.findById(recordId)
      .populate("patient", "name email phoneNumber")
      .populate("doctor", "name email")
      .populate("appointment", "date timeSlot status")
      .populate("assignedCourses", "title thumbnail category");

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("❌ Get Record Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
