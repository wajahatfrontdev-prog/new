const mongoose = require("mongoose");
require("dotenv").config();

const MedicalRecord = require("../models/medicalRecord");
const User = require("../models/user");
const Appointment = require("../models/appointment");

const addTestMedicalRecords = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const doctor = await User.findOne({ role: "Doctor" });
    const patient = await User.findOne({ role: "Patient" });

    if (!doctor) {
      console.log("❌ No doctor found. Please create a doctor account first.");
      process.exit(1);
    }

    if (!patient) {
      console.log(
        "❌ No patient found. Please create a patient account first.",
      );
      process.exit(1);
    }

    console.log(`\n👨‍⚕️ Doctor: ${doctor.name} (${doctor.email})`);
    console.log(`👤 Patient: ${patient.name} (${patient.email})`);

    const appointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patient._id,
    });

    const sampleRecords = [
      {
        patient: patient._id,
        doctor: doctor._id,
        appointment: appointment?._id,
        diagnosis: "Common Cold with Mild Fever",
        symptoms: [
          "Runny nose",
          "Sore throat",
          "Mild fever (100.4°F)",
          "Fatigue",
          "Headache",
        ],
        prescription: [
          {
            medicineName: "Paracetamol",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "5 days",
            instructions: "Take after meals",
          },
          {
            medicineName: "Cetirizine",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "7 days",
            instructions: "Take before bedtime",
          },
        ],
        labTests: ["Complete Blood Count (CBC)", "Throat Swab Culture"],
        vitalSigns: {
          bloodPressure: "120/80",
          temperature: "100.4",
          heartRate: 78,
          weight: 70,
          height: 175,
        },
        notes:
          "Patient advised to rest and stay hydrated. Avoid cold beverages. Follow up if symptoms persist beyond 7 days.",
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      },
      {
        patient: patient._id,
        doctor: doctor._id,
        appointment: appointment?._id,
        diagnosis: "Hypertension - Stage 1",
        symptoms: ["Occasional headaches", "Dizziness", "Fatigue"],
        prescription: [
          {
            medicineName: "Amlodipine",
            dosage: "5mg",
            frequency: "Once daily",
            duration: "30 days",
            instructions: "Take in the morning with water",
          },
        ],
        labTests: [
          "Blood Pressure Monitoring",
          "Lipid Profile",
          "Kidney Function Test",
        ],
        vitalSigns: {
          bloodPressure: "145/92",
          temperature: "98.6",
          heartRate: 82,
          weight: 75,
          height: 175,
        },
        notes:
          "Patient advised to reduce salt intake, exercise regularly (30 min daily), and monitor BP at home. Lifestyle modifications are crucial.",
        followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      },
      {
        patient: patient._id,
        doctor: doctor._id,
        appointment: appointment?._id,
        diagnosis: "Vitamin D Deficiency",
        symptoms: ["Bone pain", "Muscle weakness", "Fatigue", "Mood changes"],
        prescription: [
          {
            medicineName: "Vitamin D3",
            dosage: "60,000 IU",
            frequency: "Once weekly",
            duration: "8 weeks",
            instructions:
              "Take with milk or after a fatty meal for better absorption",
          },
          {
            medicineName: "Calcium Carbonate",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "60 days",
            instructions: "Take with meals",
          },
        ],
        labTests: [
          "Vitamin D Level Test",
          "Calcium Level",
          "Bone Density Scan",
        ],
        vitalSigns: {
          bloodPressure: "118/76",
          temperature: "98.4",
          heartRate: 72,
          weight: 68,
          height: 175,
        },
        notes:
          "Patient should get 15-20 minutes of sunlight exposure daily. Include vitamin D rich foods like fish, eggs, and fortified milk.",
        followUpDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 
      },
    ];

    console.log("\n📋 Creating medical records...");

    for (let i = 0; i < sampleRecords.length; i++) {
      const record = await MedicalRecord.create(sampleRecords[i]);
      console.log(`✅ Record ${i + 1} created: ${record.diagnosis}`);
    }

    console.log("\n✅ All test medical records created successfully!");
    console.log("\n📝 Summary:");
    console.log(`   - Doctor: ${doctor.name}`);
    console.log(`   - Patient: ${patient.name}`);
    console.log(`   - Records created: ${sampleRecords.length}`);
    console.log("\n🔍 How to test:");
    console.log("   1. Login as doctor:", doctor.email);
    console.log('   2. Go to "Patient Records" from sidebar/drawer');
    console.log("   3. Search for patient:", patient.name);
    console.log("   4. Click on patient to view their medical records");
    console.log("   5. Click on any record to view full details");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

addTestMedicalRecords();
