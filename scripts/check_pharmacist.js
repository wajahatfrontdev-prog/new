require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/icare';

async function checkPharmacist() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const user = await User.findOne({ email: 'pharmacist@gmail.com' });
    
    if (!user) {
      console.log('❌ Pharmacist user NOT found!');
      console.log('Run: node add_test_pharmacist.js');
      return;
    }

    console.log('✅ Pharmacist user found:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   ID:', user._id);

    const pharmacy = await Pharmacy.findOne({ user: user._id });
    
    if (!pharmacy) {
      console.log('\n❌ Pharmacy profile NOT found!');
    } else {
      console.log('\n✅ Pharmacy profile found:');
      console.log('   ID:', pharmacy._id);
      console.log('   Owner:', pharmacy.ownerName);
      console.log('   City:', pharmacy.city);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkPharmacist();
