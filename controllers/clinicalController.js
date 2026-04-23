const { IntakeNotes, SoapNotes, Referral, LifestyleLog } = require('../models/clinical');
const Appointment = require('../models/appointment');
const Notification = require('../models/notification');
const ClinicalAudit = require('../models/clinicalAudit');

exports.saveIntakeNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Check if already finalized
    const existing = await IntakeNotes.findOne({ appointment: appointmentId });
    if (existing && existing.isFinalized) {
      return res.status(403).json({ message: "Clinical note is finalized and cannot be modified." });
    }

    const { isFinalized } = req.body;
    const notes = await IntakeNotes.findOneAndUpdate(
      { appointment: appointmentId },
      { 
        ...req.body, 
        patient: appointment.patient, 
        doctor: appointment.doctor,
        finalizedAt: isFinalized ? new Date() : undefined
      },
      { upsert: true, new: true }
    );

    if (isFinalized) {
      await ClinicalAudit.create({
        action: 'INTAKE_NOTE_FINALIZED',
        performedBy: userId,
        targetUser: appointment.patient,
        relatedId: notes._id,
        onModel: 'IntakeNotes',
        details: { appointmentId }
      });
    }

    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Save Intake Notes Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getIntakeNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const notes = await IntakeNotes.findOne({ appointment: appointmentId });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Get Intake Notes Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveSoapNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Check if already finalized
    const existing = await SoapNotes.findOne({ appointment: appointmentId });
    if (existing && existing.isFinalized) {
      return res.status(403).json({ message: "Clinical note is finalized and cannot be modified." });
    }

    const { isFinalized } = req.body;
    const notes = await SoapNotes.findOneAndUpdate(
      { appointment: appointmentId },
      { 
        ...req.body, 
        patient: appointment.patient, 
        doctor: appointment.doctor,
        finalizedAt: isFinalized ? new Date() : undefined
      },
      { upsert: true, new: true }
    );

    if (isFinalized) {
      await ClinicalAudit.create({
        action: 'SOAP_NOTE_FINALIZED',
        performedBy: userId,
        targetUser: appointment.patient,
        relatedId: notes._id,
        onModel: 'SoapNotes',
        details: { appointmentId }
      });
    }

    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Save SOAP Notes Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSoapNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const notes = await SoapNotes.findOne({ appointment: appointmentId });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Get SOAP Notes Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createReferral = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId, referredTo, reason, clinicalNotes, attachedRecords } = req.body;
    
    const referral = await Referral.create({ 
      doctor: doctorId, 
      patient: patientId, 
      referredTo, 
      reason,
      clinicalNotes,
      attachedRecords: attachedRecords || []
    });
    
    // Notify target doctor
    await Notification.create({
      user: referredTo,
      title: "New Referral",
      message: `Dr. ${req.user.name} has referred a patient to you.`,
      type: "referral",
      data: { referralId: referral._id, patientId }
    });

    // Notify patient
    await Notification.create({
      user: patientId,
      title: "Referral Created",
      message: `You have been referred to a specialist for further consultation.`,
      type: "referral",
      data: { referralId: referral._id }
    });

    const populatedReferral = await Referral.findById(referral._id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('referredTo', 'name email specialization');

    res.status(201).json({ success: true, referral: populatedReferral });
  } catch (error) {
    console.error("Create Referral Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyReferrals = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const referrals = await Referral.find({ doctor: doctorId })
      .populate('patient', 'name email phoneNumber')
      .populate('referredTo', 'name email specialization')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, referrals });
  } catch (error) {
    console.error("Get My Referrals Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReceivedReferrals = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const referrals = await Referral.find({ referredTo: doctorId })
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email phoneNumber')
      .populate('attachedRecords')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, referrals });
  } catch (error) {
    console.error("Get Received Referrals Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const doctorId = req.user._id;

    const referral = await Referral.findOne({ _id: referralId, referredTo: doctorId });
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    referral.status = 'accepted';
    referral.acceptedAt = new Date();
    await referral.save();

    // Auto-create pending appointment
    const Appointment = require('../models/appointment');
    const appointment = await Appointment.create({
      patient: referral.patient,
      doctor: doctorId,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      timeSlot: '09:00 AM',
      consultationType: 'Online',
      reason: `Referral: ${referral.reason}`,
      status: 'pending',
      referral: referralId
    });

    // Update referral with appointment
    referral.appointmentId = appointment._id;
    await referral.save();

    // Notify referring doctor
    await Notification.create({
      user: referral.doctor,
      title: "Referral Accepted",
      message: `Your referral has been accepted by the specialist. Appointment scheduled.`,
      type: "referral",
      data: { referralId: referral._id, appointmentId: appointment._id }
    });

    // Notify patient
    await Notification.create({
      user: referral.patient,
      title: "Referral Accepted - Appointment Scheduled",
      message: `The specialist has accepted your referral. A consultation has been scheduled.`,
      type: "referral",
      data: { referralId: referral._id, appointmentId: appointment._id }
    });

    const populatedReferral = await Referral.findById(referral._id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('referredTo', 'name email specialization')
      .populate('appointmentId');

    res.status(200).json({ success: true, referral: populatedReferral, appointment });
  } catch (error) {
    console.error("Accept Referral Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.declineReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { reason } = req.body;
    const doctorId = req.user._id;

    const referral = await Referral.findOne({ _id: referralId, referredTo: doctorId });
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    referral.status = 'declined';
    referral.declineReason = reason;
    await referral.save();

    // Notify referring doctor
    await Notification.create({
      user: referral.doctor,
      title: "Referral Declined",
      message: `Your referral has been declined. Reason: ${reason}`,
      type: "referral",
      data: { referralId: referral._id }
    });

    res.status(200).json({ success: true, referral });
  } catch (error) {
    console.error("Decline Referral Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.completeReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { consultationSummary } = req.body;
    const doctorId = req.user._id;

    const referral = await Referral.findOne({ _id: referralId, referredTo: doctorId });
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    referral.status = 'completed';
    referral.completedAt = new Date();
    referral.consultationSummary = consultationSummary;
    await referral.save();

    // Notify referring doctor with summary
    await Notification.create({
      user: referral.doctor,
      title: "Referral Completed",
      message: `The specialist has completed the consultation for your referral.`,
      type: "referral",
      data: { referralId: referral._id, summary: consultationSummary }
    });

    res.status(200).json({ success: true, referral });
  } catch (error) {
    console.error("Complete Referral Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.assignProgram = async (req, res) => {
  try {
    const { patientId, courseId } = req.body;
    const StudentCourseEnrollment = require('../models/studentCourseEnrollment');
    const InstructorCourse = require('../models/instructorCourse');

    const course = await InstructorCourse.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const totalVideos = Array.isArray(course.videos) ? course.videos.length : 0;

    const enrollment = await StudentCourseEnrollment.create({
      user: patientId,
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

exports.getHealthJourney = async (req, res) => {
  try {
    const userId = req.user._id;
    // Simple timeline aggregation from appointments and medical records
    const MedicalRecord = require('../models/medicalRecord');
    const records = await MedicalRecord.find({ patient: userId }).populate('doctor', 'name').sort({ createdAt: -1 });
    
    const timeline = records.map(r => ({
      recordId: r._id.toString(), // Add record ID for navigation
      date: r.createdAt,
      type: 'Consultation',
      title: r.diagnosis || 'General Checkup',
      doctor: r.doctor?.name || 'Doctor',
      description: r.notes || 'Medical record created'
    }));

    res.status(200).json({ success: true, timeline });
  } catch (error) {
    console.error("Get Health Journey Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logLifestyleActivity = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { type, value } = req.body;
    const log = await LifestyleLog.create({ patient: patientId, type, value });
    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Log Lifestyle Activity Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLifestyleSummary = async (req, res) => {
  try {
    const patientId = req.user._id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const logs = await LifestyleLog.find({ patient: patientId, createdAt: { $gte: startOfDay } });
    
    // Aggregate daily metrics
    const metrics = {
      water: "0 / 2.5 L",
      steps: "0 / 10k",
      sleep: "0 / 8 h",
      calories: "0 / 2k"
    };

    let water = 0;
    let steps = 0;
    let sleep = 0;
    let calories = 0;

    logs.forEach(l => {
      const val = parseFloat(l.value) || 0;
      if (l.type === 'water') water += val;
      if (l.type === 'steps') steps += val;
      if (l.type === 'sleep') sleep += val;
      if (l.type === 'calories') calories += val;
    });

    metrics.water = `${water.toFixed(1)} / 2.5 L`;
    metrics.steps = `${steps} / 10k`;
    metrics.sleep = `${sleep.toFixed(1)} / 8 h`;
    metrics.calories = `${calories} / 2k`;

    // Overall progress: average of all 4 goals
    const progress = (
      Math.min(water / 2.5, 1) + 
      Math.min(steps / 10000, 1) + 
      Math.min(sleep / 8, 1) + 
      Math.min(calories / 2000, 1)
    ) / 4;

    const recentLogs = logs.slice(-5).map(l => ({
      message: `Logged ${l.value} for ${l.type}`,
      timeAgo: 'Today'
    }));

    res.status(200).json({
      success: true,
      summary: {
        overallProgress: progress,
        metrics,
        recentLogs
      }
    });
  } catch (error) {
    console.error("Get Lifestyle Summary Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addAddendum = async (req, res) => {
  try {
    const { appointmentId, type } = req.params; // type: 'intake' or 'soap'
    const { text } = req.body;
    const userId = req.user._id;

    const Model = type === 'intake' ? IntakeNotes : SoapNotes;
    const notes = await Model.findOne({ appointment: appointmentId });
    if (!notes) return res.status(404).json({ message: "Note not found" });

    if (!notes.isFinalized) {
      return res.status(400).json({ message: "Notes must be finalized before adding an addendum. Use regular edit instead." });
    }

    notes.addendums.push({ text, signedBy: userId });
    await notes.save();

    await ClinicalAudit.create({
      action: 'CLINICAL_ADDENDUM_ADDED',
      performedBy: userId,
      targetUser: notes.patient,
      relatedId: notes._id,
      onModel: type === 'intake' ? 'IntakeNotes' : 'SoapNotes',
      details: { appointmentId, type }
    });

    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Add Addendum Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
