require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'pharmacist@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Hash the password directly (bypass the pre-save hook)
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.updateOne(
      { email: 'pharmacist@gmail.com' },
      { $set: { password: hashedPassword } }
    );

    console.log('✅ Password reset successfully for pharmacist@gmail.com');
    console.log('   Password: 123456');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
