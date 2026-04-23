/**
 * Test script for email verification system
 * This script tests the complete email verification flow locally
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  role: 'Patient',
  phoneNumber: '+923001234567'
};

async function testEmailVerification() {
  console.log('🧪 Starting Email Verification Test...\n');

  try {
    // Step 1: Register a new user
    console.log('📝 Step 1: Registering new user...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('   User ID:', registerResponse.data._id);
    console.log('   Email Verified:', registerResponse.data.isEmailVerified);
    console.log('   Message:', registerResponse.data.message);
    console.log('');

    // Step 2: Get the verification token from database (for testing)
    console.log('📧 Step 2: Checking verification token in database...');
    console.log('   In production, this would be sent via email');
    console.log('   For testing, check MongoDB or use the script below');
    console.log('');

    // Step 3: Simulate getting token from database
    console.log('💡 To get the verification token, run this MongoDB query:');
    console.log(`   db.users.findOne({ email: "${testUser.email}" }, { emailVerificationToken: 1 })`);
    console.log('');

    // Step 4: Instructions for manual verification
    console.log('🔐 Step 3: Verify email with token');
    console.log('   Once you have the token, test verification with:');
    console.log(`   curl -X POST ${BASE_URL}/verify-email \\`);
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"token": "YOUR_TOKEN_HERE"}\'');
    console.log('');

    // Step 5: Test resend verification
    console.log('📬 Step 4: Test resend verification email');
    const resendResponse = await axios.post(`${BASE_URL}/resend-verification`, {
      email: testUser.email
    });
    console.log('✅ Resend successful!');
    console.log('   Message:', resendResponse.data.message);
    console.log('');

    console.log('✨ Test completed! Next steps:');
    console.log('   1. Get the verification token from MongoDB');
    console.log('   2. Call /verify-email endpoint with the token');
    console.log('   3. Try logging in and accessing protected routes');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Helper function to verify email with token
async function verifyEmailWithToken(token) {
  try {
    console.log('🔐 Verifying email with token...');
    const response = await axios.post(`${BASE_URL}/verify-email`, { token });
    console.log('✅ Email verified successfully!');
    console.log('   User:', response.data.user);
    return response.data;
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
  }
}

// Run the test
if (require.main === module) {
  testEmailVerification();
}

module.exports = { testEmailVerification, verifyEmailWithToken };
