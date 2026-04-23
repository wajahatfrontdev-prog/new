const mongoose = require('mongoose');
const PrescriptionTemplate = require('../models/prescriptionTemplate');
const User = require('../models/user');
require('dotenv').config();

async function addTestTemplates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find amaan@gmail.com doctor
    const doctor = await User.findOne({ email: 'amaan@gmail.com' });
    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }

    console.log('📋 Adding test templates for:', doctor.email);

    // Clear existing templates
    await PrescriptionTemplate.deleteMany({ doctor: doctor._id });
    console.log('🗑️  Cleared existing templates');

    // Create test templates
    const templates = [
      {
        doctor: doctor._id,
        name: 'Common Cold',
        medicines: [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
          { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5 days' },
        ]
      },
      {
        doctor: doctor._id,
        name: 'Fever & Headache',
        medicines: [
          { name: 'Ibuprofen', dosage: '400mg', frequency: 'Three times daily', duration: '3 days' },
          { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '5 days' },
        ]
      },
      {
        doctor: doctor._id,
        name: 'Allergies',
        medicines: [
          { name: 'Loratadine', dosage: '10mg', frequency: 'Once daily', duration: '7 days' },
          { name: 'Nasal Spray', dosage: '2 sprays', frequency: 'Twice daily', duration: '7 days' },
        ]
      },
    ];

    await PrescriptionTemplate.insertMany(templates);
    console.log(`✅ Created ${templates.length} test templates`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestTemplates();
