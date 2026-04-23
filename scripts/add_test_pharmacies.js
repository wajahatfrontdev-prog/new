const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');

// Load .env from the correct location
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pharmaciesData = [
  {
    email: 'healthplus@pharmacy.com',
    password: 'pharmacy123',
    name: 'Health Plus Pharmacy',
    phoneNumber: '+92-300-1234567',
    ownerName: 'Ahmed Khan',
    cnic: '42101-1234567-1',
    licenseNumber: 'PH-2024-001',
    address: '123 Main Street, Karachi',
    city: 'Karachi',
    openHours: { from: '08:00', to: '22:00' },
    deliveryAvailable: true,
    isApproved: true,
  },
  {
    email: 'carewell@pharmacy.com',
    password: 'pharmacy123',
    name: 'CareWell Pharmacy',
    phoneNumber: '+92-300-2345678',
    ownerName: 'Fatima Ali',
    cnic: '42101-2345678-2',
    licenseNumber: 'PH-2024-002',
    address: '456 Garden Road, Lahore',
    city: 'Lahore',
    openHours: { from: '09:00', to: '21:00' },
    deliveryAvailable: true,
    isApproved: true,
  },
  {
    email: 'medlife@pharmacy.com',
    password: 'pharmacy123',
    name: 'MedLife Pharmacy',
    phoneNumber: '+92-300-3456789',
    ownerName: 'Hassan Raza',
    cnic: '42101-3456789-3',
    licenseNumber: 'PH-2024-003',
    address: '789 University Road, Islamabad',
    city: 'Islamabad',
    openHours: { from: '00:00', to: '23:59' },
    deliveryAvailable: true,
    isApproved: true,
  },
  {
    email: 'quickmed@pharmacy.com',
    password: 'pharmacy123',
    name: 'QuickMed Pharmacy',
    phoneNumber: '+92-300-4567890',
    ownerName: 'Sara Ahmed',
    cnic: '42101-4567890-4',
    licenseNumber: 'PH-2024-004',
    address: '321 Mall Road, Rawalpindi',
    city: 'Rawalpindi',
    openHours: { from: '07:00', to: '23:00' },
    deliveryAvailable: true,
    isApproved: true,
  },
  {
    email: 'wellness@pharmacy.com',
    password: 'pharmacy123',
    name: 'Wellness Pharmacy',
    phoneNumber: '+92-300-5678901',
    ownerName: 'Ali Zafar',
    cnic: '42101-5678901-5',
    licenseNumber: 'PH-2024-005',
    address: '555 Clifton Block 5, Karachi',
    city: 'Karachi',
    openHours: { from: '08:00', to: '22:00' },
    deliveryAvailable: true,
    isApproved: true,
  },
];

async function addTestPharmacies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    for (const pharmacyData of pharmaciesData) {
      // Check if user already exists
      let user = await User.findOne({ email: pharmacyData.email });
      
      if (!user) {
        // Create user account
        user = await User.create({
          name: pharmacyData.name,
          email: pharmacyData.email,
          password: pharmacyData.password,
          phoneNumber: pharmacyData.phoneNumber,
          role: 'Pharmacy',
        });
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`ℹ️  User already exists: ${user.email}`);
      }

      // Check if pharmacy profile exists
      let pharmacy = await Pharmacy.findOne({ user: user._id });
      
      if (!pharmacy) {
        // Create pharmacy profile
        pharmacy = await Pharmacy.create({
          user: user._id,
          ownerName: pharmacyData.ownerName,
          cnic: pharmacyData.cnic,
          licenseNumber: pharmacyData.licenseNumber,
          address: pharmacyData.address,
          city: pharmacyData.city,
          openHours: pharmacyData.openHours,
          deliveryAvailable: pharmacyData.deliveryAvailable,
          isApproved: pharmacyData.isApproved,
        });
        console.log(`✅ Created pharmacy: ${pharmacy.ownerName}'s Pharmacy`);
      } else {
        console.log(`ℹ️  Pharmacy already exists for user: ${user.email}`);
      }
    }

    console.log('\n✅ All test pharmacies added successfully!');
    console.log('\n📋 Test Pharmacy Credentials:');
    pharmaciesData.forEach(p => {
      console.log(`   Email: ${p.email} | Password: ${p.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestPharmacies();
