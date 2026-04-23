const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user');
const Laboratory = require('../models/laboratory');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const addTestLaboratory = async () => {
  try {
    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ email: 'lab@gmail.com' });
    
    if (user) {
      console.log('⚠️  User already exists with email: lab@gmail.com');
      
      // Check if laboratory profile exists
      let lab = await Laboratory.findOne({ user: user._id });
      if (lab) {
        console.log('✅ Laboratory profile already exists');
        console.log('   Lab ID:', lab._id);
        console.log('   Lab Name:', lab.labName);
      } else {
        // Create laboratory profile
        lab = await Laboratory.create({
          user: user._id,
          labName: 'City Diagnostic Laboratory',
          ownerName: 'Lab Admin',
          licenseNumber: 'LAB-2024-001',
          isApproved: true,
          labEmail: 'lab@gmail.com',
          labPhoneNumber: '+1234567890',
          address: '123 Medical Street',
          city: 'New York',
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128]
          },
          workingHours: {
            from: '08:00 AM',
            to: '08:00 PM'
          },
          title: 'Full Service Diagnostic Laboratory',
          description: 'Complete range of diagnostic tests with home sample collection',
          testsOffered: [
            'Complete Blood Count (CBC)',
            'Lipid Profile',
            'Liver Function Test (LFT)',
            'Kidney Function Test (KFT)',
            'Thyroid Profile',
            'Blood Sugar (Fasting & PP)',
            'HbA1c',
            'Vitamin D',
            'Vitamin B12',
            'COVID-19 RT-PCR'
          ],
          homeSampleAvailable: true,
          ratings: [5, 4, 5, 5, 4],
          reviews: ['Excellent service', 'Quick results', 'Professional staff']
        });
        console.log('✅ Laboratory profile created');
        console.log('   Lab ID:', lab._id);
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('123456', 8);
      user = await User.create({
        name: 'City Diagnostic Lab',
        email: 'lab@gmail.com',
        password: hashedPassword,
        role: 'Laboratory',
        phoneNumber: '+1234567890'
      });
      console.log('✅ User created');
      console.log('   User ID:', user._id);

      // Create laboratory profile
      const lab = await Laboratory.create({
        user: user._id,
        labName: 'City Diagnostic Laboratory',
        ownerName: 'Lab Admin',
        licenseNumber: 'LAB-2024-001',
        isApproved: true,
        labEmail: 'lab@gmail.com',
        labPhoneNumber: '+1234567890',
        address: '123 Medical Street',
        city: 'New York',
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        },
        workingHours: {
          from: '08:00 AM',
          to: '08:00 PM'
        },
        title: 'Full Service Diagnostic Laboratory',
        description: 'Complete range of diagnostic tests with home sample collection',
        testsOffered: [
          'Complete Blood Count (CBC)',
          'Lipid Profile',
          'Liver Function Test (LFT)',
          'Kidney Function Test (KFT)',
          'Thyroid Profile',
          'Blood Sugar (Fasting & PP)',
          'HbA1c',
          'Vitamin D',
          'Vitamin B12',
          'COVID-19 RT-PCR'
        ],
        homeSampleAvailable: true,
        ratings: [5, 4, 5, 5, 4],
        reviews: ['Excellent service', 'Quick results', 'Professional staff']
      });
      console.log('✅ Laboratory profile created');
      console.log('   Lab ID:', lab._id);
    }

    console.log('\n📋 Test Laboratory Account:');
    console.log('   Email: lab@gmail.com');
    console.log('   Password: 123456');
    console.log('   Role: Laboratory');
    console.log('\n✅ Setup complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addTestLaboratory();
