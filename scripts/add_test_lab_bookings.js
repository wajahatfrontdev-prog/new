const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/user');
const Laboratory = require('../models/laboratory');
const LabBooking = require('../models/labBooking');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const makeBookingNumber = () => {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LAB-${Date.now().toString().slice(-6)}-${part}`;
};

const addTestBookings = async () => {
  try {
    await connectDB();

    // Find laboratory
    const labUser = await User.findOne({ email: 'lab@gmail.com' });
    if (!labUser) {
      console.log('❌ Laboratory user not found. Run add_test_laboratory.js first');
      process.exit(1);
    }

    const lab = await Laboratory.findOne({ user: labUser._id });
    if (!lab) {
      console.log('❌ Laboratory profile not found');
      process.exit(1);
    }

    // Find patient
    const patient = await User.findOne({ email: 'kinza@gmail.com' });
    if (!patient) {
      console.log('❌ Patient not found. Using lab user as patient for testing');
    }

    const patientId = patient ? patient._id : labUser._id;

    // Create test bookings
    const bookings = [
      {
        laboratory: lab._id,
        patient: patientId,
        testName: 'Complete Blood Count (CBC)',
        contactName: 'John Doe',
        contactPhone: '+1234567890',
        contactLocation: '456 Patient Street, New York',
        age: 35,
        date: new Date(),
        time: '10:00 AM',
        homeSample: true,
        status: 'pending',
        bookingNumber: makeBookingNumber()
      },
      {
        laboratory: lab._id,
        patient: patientId,
        testName: 'Lipid Profile',
        contactName: 'Jane Smith',
        contactPhone: '+1234567891',
        contactLocation: '789 Health Ave, New York',
        age: 42,
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: '11:30 AM',
        homeSample: false,
        status: 'confirmed',
        bookingNumber: makeBookingNumber()
      },
      {
        laboratory: lab._id,
        patient: patientId,
        testName: 'Thyroid Profile',
        contactName: 'Bob Johnson',
        contactPhone: '+1234567892',
        contactLocation: '321 Wellness Blvd, New York',
        age: 28,
        date: new Date(Date.now() - 86400000), // Yesterday
        time: '09:00 AM',
        homeSample: true,
        status: 'completed',
        bookingNumber: makeBookingNumber()
      },
      {
        laboratory: lab._id,
        patient: patientId,
        testName: 'Blood Sugar (Fasting & PP)',
        contactName: 'Alice Brown',
        contactPhone: '+1234567893',
        contactLocation: '654 Care Lane, New York',
        age: 55,
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        time: '08:30 AM',
        homeSample: true,
        status: 'pending',
        bookingNumber: makeBookingNumber()
      },
      {
        laboratory: lab._id,
        patient: patientId,
        testName: 'Vitamin D',
        contactName: 'Charlie Wilson',
        contactPhone: '+1234567894',
        contactLocation: '987 Health Plaza, New York',
        age: 38,
        date: new Date(Date.now() - 172800000), // 2 days ago
        time: '02:00 PM',
        homeSample: false,
        status: 'completed',
        bookingNumber: makeBookingNumber()
      }
    ];

    for (const bookingData of bookings) {
      await LabBooking.create(bookingData);
      console.log(`✅ Created booking: ${bookingData.testName} - ${bookingData.status}`);
    }

    console.log('\n✅ All test bookings created successfully!');
    console.log(`   Total bookings: ${bookings.length}`);
    console.log('   Laboratory: City Diagnostic Laboratory');
    console.log('   Login with: lab@gmail.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addTestBookings();
