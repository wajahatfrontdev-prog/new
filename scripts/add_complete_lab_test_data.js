require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Laboratory = require('../models/laboratory');
const LabBooking = require('../models/labBooking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/icare';

async function addCompleteLabTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create lab user
    let labUser = await User.findOne({ email: 'lab@gmail.com' });
    
    if (!labUser) {
      console.log('📝 Creating lab user...');
      labUser = await User.create({
        name: 'City Medical Laboratory',
        email: 'lab@gmail.com',
        password: '123456',
        role: 'Laboratory',
        phoneNumber: '+92-300-1234567',
      });
      console.log('✅ Lab user created');
    } else {
      console.log('✅ Lab user found');
    }

    // Update or create laboratory profile with complete data
    let lab = await Laboratory.findOne({ user: labUser._id });
    
    const labData = {
      user: labUser._id,
      labName: 'City Medical Laboratory',
      ownerName: 'Dr. Ahmed Khan',
      licenseNumber: 'LAB-2024-PKR-12345',
      isApproved: true,
      labEmail: 'info@citymedlab.com',
      labPhoneNumber: '+92-300-1234567',
      address: '123 Medical Plaza, Main Boulevard',
      city: 'Lahore',
      location: {
        type: 'Point',
        coordinates: [74.3587, 31.5204]
      },
      workingHours: {
        from: '08:00 AM',
        to: '10:00 PM'
      },
      title: 'Your Trusted Healthcare Partner',
      description: 'City Medical Laboratory is a state-of-the-art diagnostic facility offering comprehensive testing services with accurate results and quick turnaround times. We are equipped with the latest technology and staffed by experienced professionals.',
      testsOffered: [
        'Complete Blood Count (CBC)',
        'Lipid Profile',
        'Liver Function Test (LFT)',
        'Kidney Function Test (KFT)',
        'Thyroid Profile (T3, T4, TSH)',
        'HbA1c (Diabetes)',
        'Urine Complete Examination',
        'COVID-19 PCR Test',
        'Dengue NS1 Antigen',
        'Hepatitis B & C Screening',
        'Vitamin D Test',
        'Vitamin B12 Test',
        'X-Ray Chest',
        'Ultrasound Abdomen',
        'ECG (Electrocardiogram)'
      ],
      homeSampleAvailable: true,
    };

    if (lab) {
      console.log('📝 Updating laboratory profile...');
      await Laboratory.findByIdAndUpdate(lab._id, labData);
      console.log('✅ Laboratory profile updated');
    } else {
      console.log('📝 Creating laboratory profile...');
      lab = await Laboratory.create(labData);
      console.log('✅ Laboratory profile created');
    }

    // Create test patients
    const patients = [];
    const patientData = [
      { name: 'Ali Hassan', email: 'ali@gmail.com', phone: '+92-301-1111111' },
      { name: 'Fatima Ahmed', email: 'fatima@gmail.com', phone: '+92-302-2222222' },
      { name: 'Usman Khan', email: 'usman@gmail.com', phone: '+92-303-3333333' },
      { name: 'Ayesha Malik', email: 'ayesha@gmail.com', phone: '+92-304-4444444' },
      { name: 'Hassan Ali', email: 'hassan@gmail.com', phone: '+92-305-5555555' },
    ];

    for (const data of patientData) {
      let patient = await User.findOne({ email: data.email });
      if (!patient) {
        patient = await User.create({
          name: data.name,
          email: data.email,
          password: '123456',
          role: 'Patient',
          phoneNumber: data.phone,
        });
      }
      patients.push(patient);
    }
    console.log(`✅ ${patients.length} test patients ready`);

    // Delete existing bookings for this lab
    await LabBooking.deleteMany({ laboratory: lab._id });
    console.log('🗑️  Cleared existing bookings');

    // Create diverse bookings with different statuses and dates
    const bookings = [];
    const tests = labData.testsOffered;
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const prices = {
      'Complete Blood Count (CBC)': 800,
      'Lipid Profile': 1200,
      'Liver Function Test (LFT)': 1500,
      'Kidney Function Test (KFT)': 1400,
      'Thyroid Profile (T3, T4, TSH)': 1800,
      'HbA1c (Diabetes)': 1000,
      'Urine Complete Examination': 500,
      'COVID-19 PCR Test': 3000,
      'Dengue NS1 Antigen': 1500,
      'Hepatitis B & C Screening': 2500,
      'Vitamin D Test': 2000,
      'Vitamin B12 Test': 1800,
      'X-Ray Chest': 1200,
      'Ultrasound Abdomen': 2500,
      'ECG (Electrocardiogram)': 800,
    };

    const now = new Date();
    
    // Create 25 bookings with varied dates
    for (let i = 0; i < 25; i++) {
      const patient = patients[i % patients.length];
      const testName = tests[i % tests.length];
      const status = statuses[i % statuses.length];
      
      // Distribute bookings across different time periods
      let daysAgo;
      if (i < 5) {
        daysAgo = Math.floor(Math.random() * 7); // This week
      } else if (i < 15) {
        daysAgo = 7 + Math.floor(Math.random() * 23); // This month
      } else {
        daysAgo = 30 + Math.floor(Math.random() * 60); // Last 3 months
      }
      
      const bookingDate = new Date(now);
      bookingDate.setDate(bookingDate.getDate() - daysAgo);
      
      const hours = 8 + Math.floor(Math.random() * 12); // 8 AM to 8 PM
      const minutes = Math.random() < 0.5 ? '00' : '30';
      const time = `${hours.toString().padLeft(2, '0')}:${minutes}`;
      
      const booking = {
        patient: patient._id,
        laboratory: lab._id,
        testName: testName,
        date: bookingDate,
        time: time,
        status: status,
        price: prices[testName] || 1000,
        homeSample: Math.random() < 0.3, // 30% home sample
        notes: status === 'cancelled' ? 'Patient requested cancellation' : 
               status === 'completed' ? 'Test completed successfully' : 
               status === 'confirmed' ? 'Booking confirmed, please arrive 15 mins early' : 
               'Awaiting confirmation',
      };
      
      bookings.push(booking);
    }

    await LabBooking.insertMany(bookings);
    console.log(`✅ Created ${bookings.length} test bookings`);

    // Print summary
    console.log('\n📊 Test Data Summary:');
    console.log('='.repeat(50));
    console.log(`Laboratory: ${labData.labName}`);
    console.log(`Owner: ${labData.ownerName}`);
    console.log(`Email: ${labData.labEmail}`);
    console.log(`Tests Offered: ${labData.testsOffered.length}`);
    console.log(`Total Bookings: ${bookings.length}`);
    console.log(`  - Pending: ${bookings.filter(b => b.status === 'pending').length}`);
    console.log(`  - Confirmed: ${bookings.filter(b => b.status === 'confirmed').length}`);
    console.log(`  - Completed: ${bookings.filter(b => b.status === 'completed').length}`);
    console.log(`  - Cancelled: ${bookings.filter(b => b.status === 'cancelled').length}`);
    console.log(`Home Sample Bookings: ${bookings.filter(b => b.homeSample).length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('Email: lab@gmail.com');
    console.log('Password: 123456');
    console.log('='.repeat(50));

    console.log('\n✅ Complete lab test data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCompleteLabTestData();
