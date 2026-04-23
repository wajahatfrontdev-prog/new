require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Medicine = require('../models/medicine');
const Pharmacy = require('../models/pharmacy');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const tablets = [
  {
    productName: 'Panadol Extra 500mg',
    companyName: 'GSK',
    brand: 'Panadol',
    category: 'Pain Relief',
    medicineType: 'Tablet',
    power: '500mg',
    details: 'Fast-acting pain and fever relief. Contains paracetamol.',
    precautions: 'Do not exceed 8 tablets in 24 hours. Avoid alcohol.',
    price: 120,
    amount: '20 tablets',
    quantity: 200,
    deliveryOption: 'both',
    isAvailable: true,
  },
  {
    productName: 'Brufen 400mg',
    companyName: 'Abbott',
    brand: 'Brufen',
    category: 'Anti-inflammatory',
    medicineType: 'Tablet',
    power: '400mg',
    details: 'Ibuprofen tablet for pain, inflammation and fever.',
    precautions: 'Take with food. Not suitable for patients with stomach ulcers.',
    price: 95,
    amount: '10 tablets',
    quantity: 150,
    deliveryOption: 'both',
    isAvailable: true,
  },
  {
    productName: 'Amoxil 500mg',
    companyName: 'GSK',
    brand: 'Amoxil',
    category: 'Antibiotic',
    medicineType: 'Tablet',
    power: '500mg',
    details: 'Amoxicillin antibiotic for bacterial infections.',
    precautions: 'Complete the full course. Inform doctor of any allergies.',
    price: 180,
    amount: '14 tablets',
    quantity: 100,
    deliveryOption: 'both',
    isAvailable: true,
  },
  {
    productName: 'Metformin 500mg',
    companyName: 'Sanofi',
    brand: 'Glucophage',
    category: 'Diabetes',
    medicineType: 'Tablet',
    power: '500mg',
    details: 'Used to control blood sugar levels in type 2 diabetes.',
    precautions: 'Take with meals. Monitor blood sugar regularly.',
    price: 210,
    amount: '30 tablets',
    quantity: 80,
    deliveryOption: 'both',
    isAvailable: true,
  },
  {
    productName: 'Atorvastatin 20mg',
    companyName: 'Pfizer',
    brand: 'Lipitor',
    category: 'Cholesterol',
    medicineType: 'Tablet',
    power: '20mg',
    details: 'Lowers bad cholesterol and reduces risk of heart disease.',
    precautions: 'Avoid grapefruit juice. Report muscle pain immediately.',
    price: 350,
    amount: '30 tablets',
    quantity: 60,
    deliveryOption: 'both',
    isAvailable: true,
  },
  {
    productName: 'Omeprazole 20mg',
    companyName: 'AstraZeneca',
    brand: 'Losec',
    category: 'Gastric',
    medicineType: 'Tablet',
    power: '20mg',
    details: 'Proton pump inhibitor for acid reflux and stomach ulcers.',
    precautions: 'Take 30 minutes before meals. Long-term use requires monitoring.',
    price: 160,
    amount: '14 tablets',
    quantity: 120,
    deliveryOption: 'both',
    isAvailable: true,
  },
  {
    productName: 'Cetirizine 10mg',
    companyName: 'UCB',
    brand: 'Zyrtec',
    category: 'Allergy',
    medicineType: 'Tablet',
    power: '10mg',
    details: 'Antihistamine for allergies, hay fever and hives.',
    precautions: 'May cause drowsiness. Avoid driving after taking.',
    price: 75,
    amount: '10 tablets',
    quantity: 180,
    deliveryOption: 'both',
    isAvailable: true,
  },
  {
    productName: 'Vitamin D3 1000IU',
    companyName: 'Nutrifactor',
    brand: 'Nutrifactor',
    category: 'Vitamins',
    medicineType: 'Tablet',
    power: '1000IU',
    details: 'Supports bone health, immune function and calcium absorption.',
    precautions: 'Do not exceed recommended dose. Store in cool dry place.',
    price: 450,
    amount: '60 tablets',
    quantity: 90,
    deliveryOption: 'both',
    isAvailable: true,
  },
];

async function seedTablets() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const pharmacy = await Pharmacy.findOne();
    if (!pharmacy) {
      console.log('❌ No pharmacy found. Run add_test_pharmacist.js first.');
      return;
    }
    console.log(`📦 Using pharmacy: ${pharmacy.ownerName || pharmacy._id}`);

    let added = 0;
    for (const tablet of tablets) {
      const exists = await Medicine.findOne({
        pharmacy: pharmacy._id,
        productName: tablet.productName,
      });
      if (!exists) {
        await Medicine.create({
          ...tablet,
          pharmacy: pharmacy._id,
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
        console.log(`  ✅ Added: ${tablet.productName}`);
        added++;
      } else {
        console.log(`  ⏭️  Already exists: ${tablet.productName}`);
      }
    }

    const total = await Medicine.countDocuments({ pharmacy: pharmacy._id });
    console.log(`\n🎉 Done! Added ${added} new tablets. Total medicines: ${total}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seedTablets();
