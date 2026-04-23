const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test endpoints
const endpoints = {
  gamification: [
    { method: 'GET', path: '/gamification/my-stats', requiresAuth: true },
    { method: 'GET', path: '/gamification/leaderboard', requiresAuth: true },
    { method: 'POST', path: '/gamification/award-points', requiresAuth: true, data: { points: 10, reason: 'test' } }
  ],
  subscriptions: [
    { method: 'GET', path: '/subscriptions/plans', requiresAuth: false },
    { method: 'GET', path: '/subscriptions/my-subscription', requiresAuth: true },
    { method: 'POST', path: '/subscriptions/subscribe', requiresAuth: true, data: { planId: 'test', paymentMethod: 'Card', transactionId: 'TXN123' } }
  ],
  clinical: [
    { method: 'GET', path: '/clinical/referrals/my', requiresAuth: true },
    { method: 'GET', path: '/clinical/referrals/received', requiresAuth: true },
    { method: 'GET', path: '/clinical/health-journey', requiresAuth: true }
  ],
  laboratories: [
    { method: 'GET', path: '/laboratories/bookings/my', requiresAuth: true }
  ]
};

async function testEndpoint(endpoint, token) {
  try {
    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      headers: endpoint.requiresAuth && token ? { Authorization: `Bearer ${token}` } : {}
    };

    if (endpoint.data) {
      config.data = endpoint.data;
    }

    const response = await axios(config);
    console.log(`✅ ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - Status: ${error.response.status} - ${error.response.data.message || 'Error'}`);
    } else {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Backend Endpoints\n');
  console.log('Note: Some endpoints require authentication and will fail without a valid token\n');

  let totalTests = 0;
  let passedTests = 0;

  for (const [category, tests] of Object.entries(endpoints)) {
    console.log(`\n📦 Testing ${category.toUpperCase()} endpoints:`);
    
    for (const test of tests) {
      totalTests++;
      const passed = await testEndpoint(test);
      if (passed) passedTests++;
    }
  }

  console.log(`\n\n📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests < totalTests) {
    console.log('\n⚠️  Some tests failed. This is expected if:');
    console.log('   - Server is not running');
    console.log('   - Endpoints require authentication');
    console.log('   - Database is not seeded with test data');
  }
}

runTests();
