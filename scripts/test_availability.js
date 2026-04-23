const mongoose = require('mongoose');
const Doctor = require('../models/doctor');
const User = require('../models/user');
require('dotenv').config();

async function testAvailability() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find amaan@gmail.com user
    const user = await User.findOne({ email: 'amaan@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('📋 User found:', user.email, user._id);

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: user._id });
    
    if (!doctor) {
      console.log('⚠️  No doctor profile found for this user');
      console.log('Creating default doctor profile...');
      
      const newDoctor = await Doctor.create({
        user: user._id,
        specialization: 'General Physician',
        degrees: ['MBBS'],
        experience: '5 years',
        licenseNumber: 'LIC123456',
        clinicName: 'Test Clinic',
        clinicAddress: 'Test Address',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTime: { start: '09:00', end: '17:00' },
        unavailableDates: []
      });
      
      console.log('✅ Doctor profile created');
      console.log(newDoctor);
    } else {
      console.log('✅ Doctor profile found');
      console.log('Available Days:', doctor.availableDays);
      console.log('Available Time:', doctor.availableTime);
      console.log('Unavailable Dates:', doctor.unavailableDates);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAvailability();
