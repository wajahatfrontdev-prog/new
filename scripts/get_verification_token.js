/**
 * Helper script to get verification token from MongoDB
 * Run this after registering a user to get their verification token
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/user');

async function getVerificationToken(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user by email
    const user = await User.findOne({ email }).select(
      'name email emailVerificationToken emailVerificationExpiry isEmailVerified'
    );

    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    console.log('👤 User Information:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('');

    if (user.isEmailVerified) {
      console.log('✅ Email is already verified!');
    } else if (user.emailVerificationToken) {
      console.log('🔑 Verification Token:');
      console.log('   ', user.emailVerificationToken);
      console.log('');
      console.log('⏰ Token Expiry:');
      console.log('   ', new Date(user.emailVerificationExpiry).toLocaleString());
      console.log('');
      console.log('📋 To verify, use this curl command:');
      console.log('');
      console.log(`curl -X POST http://localhost:5000/api/auth/verify-email \\`);
      console.log('     -H "Content-Type: application/json" \\');
      console.log(`     -d '{"token": "${user.emailVerificationToken}"}'`);
      console.log('');
    } else {
      console.log('⚠️  No verification token found. User may need to resend verification email.');
    }

    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node get_verification_token.js <email>');
  console.log('Example: node get_verification_token.js testuser@example.com');
  process.exit(1);
}

getVerificationToken(email);
