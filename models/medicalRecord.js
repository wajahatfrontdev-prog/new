const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: String,
    symptoms: [String],
    prescription: {
        medicines: [{
            name: String,
            dosage: String,
            frequency: String,
            duration: String,
            instructions: String
        }],
        notes: String
    },
    labTests: [String],
    vitalSigns: {
        bloodPressure: String,
        temperature: String,
        heartRate: String,
        weight: String,
        height: String,
        oxygenSaturation: String,
        respiratoryRate: String,
        bmi: String
    },
    notes: String,
    interactionWarning: String, // Simulated drug interaction warning
    followUpDate: Date,
    referredLaboratory: { type: mongoose.Schema.Types.ObjectId, ref: "Laboratory" },
    selectedPharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "InstructorCourse" }],
    // CRITICAL FIX: Add SOAP Notes and Intake Notes for patient visibility
    intakeNotes: {
        chiefComplaint: String,
        historyOfPresentIllness: String,
        pastMedicalHistory: String,
        medications: String,
        allergies: String,
        socialHistory: String,
        familyHistory: String,
        reviewOfSystems: String
    },
    soapNotes: {
        subjective: {
            chiefComplaint: String,
            historyOfPresentIllness: String,
            reviewOfSystems: String,
            patientConcerns: String
        },
        objective: {
            vitalSigns: {
                bloodPressure: String,
                heartRate: String,
                temperature: String,
                respiratoryRate: String,
                oxygenSaturation: String,
                weight: String,
                height: String,
                bmi: String
            },
            physicalExamination: String,
            labResults: String,
            imagingResults: String
        },
        assessment: {
            diagnosis: [String],
            differentialDiagnosis: [String],
            clinicalImpression: String,
            icdCodes: [String]
        },
        plan: {
            treatment: String,
            medications: [String],
            labTests: [String],
            imaging: [String],
            referrals: [String],
            followUp: String,
            patientEducation: String
        }
    },
    isFinalized: { type: Boolean, default: false },
    finalizedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
