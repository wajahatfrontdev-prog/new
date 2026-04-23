require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');
const Medicine = require('../models/medicine');
const PharmacyOrder = require('../models/pharmacyOrder');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/icare';

async function createTestPharmacist() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create pharmacist user
    const email = 'pharmacist@gmail.com';
    let user = await User.findOne({ email });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      user = await User.create({
        name: 'Test Pharmacist',
        email,
        password: hashedPassword,
        role: 'Pharmacy',
        phoneNumber: '+1234567890',
      });
      console.log('Created pharmacist user:', email);
    } else {
      console.log('Pharmacist user already exists:', email);
    }

    // Create pharmacy profile
    let pharmacy = await Pharmacy.findOne({ user: user._id });
    
    if (!pharmacy) {
      pharmacy = await Pharmacy.create({
        user: user._id,
        cnic: '12345-1234567-1',
        ownerName: 'Test Pharmacist',
        licenseNumber: 'PH-2024-001',
        address: '123 Main Street',
        city: 'Karachi',
        location: {
          type: 'Point',
          coordinates: [67.0011, 24.8607]
        },
        deliveryAvailable: true,
        openHours: {
          from: '09:00',
          to: '21:00'
        },
        isApproved: true,
      });
      console.log('Created pharmacy profile');
    } else {
      console.log('Pharmacy profile already exists');
    }

    // Create test medicines
    const existingMedicines = await Medicine.find({ pharmacy: pharmacy._id });
    
    if (existingMedicines.length === 0) {
      const medicines = [
        {
          pharmacy: pharmacy._id,
          productName: 'Paracetamol 500mg',
          companyName: 'PharmaCorp',
          category: 'Pain Relief',
          medicineType: 'Tablet',
          power: '500mg',
          price: 5.99,
          quantity: 150,
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isAvailable: true,
        },
        {
          pharmacy: pharmacy._id,
          productName: 'Ibuprofen 400mg',
          companyName: 'MediCare',
          category: 'Pain Relief',
          medicineType: 'Tablet',
          power: '400mg',
          price: 8.99,
          quantity: 25,
          expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          isAvailable: true,
        },
        {
          pharmacy: pharmacy._id,
          productName: 'Amoxicillin 250mg',
          companyName: 'BioPharm',
          category: 'Antibiotics',
          medicineType: 'Capsule',
          power: '250mg',
          price: 12.99,
          quantity: 80,
          expiry: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000),
          isAvailable: true,
        },
        {
          pharmacy: pharmacy._id,
          productName: 'Cetirizine 10mg',
          companyName: 'AllerCare',
          category: 'Allergy',
          medicineType: 'Tablet',
          power: '10mg',
          price: 6.99,
          quantity: 200,
          expiry: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000),
          isAvailable: true,
        },
        {
          pharmacy: pharmacy._id,
          productName: 'Vitamin C 1000mg',
          companyName: 'VitaHealth',
          category: 'Vitamins',
          medicineType: 'Tablet',
          power: '1000mg',
          price: 9.99,
          quantity: 120,
          expiry: new Date(Date.now() + 500 * 24 * 60 * 60 * 1000),
          isAvailable: true,
        },
      ];

      await Medicine.insertMany(medicines);
      console.log(`Created ${medicines.length} test medicines`);
    } else {
      console.log(`${existingMedicines.length} medicines already exist`);
    }

    // Create test orders
    const patientUser = await User.findOne({ email: 'kinza@gmail.com' });
    
    if (patientUser) {
      const existingOrders = await PharmacyOrder.find({ pharmacy: pharmacy._id });
      
      if (existingOrders.length === 0) {
        const medicines = await Medicine.find({ pharmacy: pharmacy._id }).limit(3);
        
        const orders = [
          {
            pharmacy: pharmacy._id,
            user: patientUser._id,
            items: [
              {
                medicine: medicines[0]._id,
                productName: medicines[0].productName,
                price: medicines[0].price,
                quantity: 2,
              },
              {
                medicine: medicines[1]._id,
                productName: medicines[1].productName,
                price: medicines[1].price,
                quantity: 1,
              },
            ],
            totalAmount: medicines[0].price * 2 + medicines[1].price,
            deliveryOption: 'delivery',
            address: '456 Patient Street, Karachi',
            status: 'pending',
            orderNumber: `PO-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          },
          {
            pharmacy: pharmacy._id,
            user: patientUser._id,
            items: [
              {
                medicine: medicines[2]._id,
                productName: medicines[2].productName,
                price: medicines[2].price,
                quantity: 1,
              },
            ],
            totalAmount: medicines[2].price,
            deliveryOption: 'pickup',
            address: '456 Patient Street, Karachi',
            status: 'completed',
            orderNumber: `PO-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ];

        await PharmacyOrder.insertMany(orders);
        console.log(`Created ${orders.length} test orders`);
      } else {
        console.log(`${existingOrders.length} orders already exist`);
      }
    } else {
      console.log('Patient user (kinza@gmail.com) not found, skipping order creation');
    }

    console.log('\n=== Test Pharmacist Account ===');
    console.log('Email: pharmacist@gmail.com');
    console.log('Password: 123456');
    console.log('Role: Pharmacy');
    console.log('\nYou can now login and test the pharmacist portal!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createTestPharmacist();
