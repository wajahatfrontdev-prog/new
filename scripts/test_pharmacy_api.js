require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPharmacyAPI() {
  try {
    console.log('🧪 Testing Pharmacy API endpoints...\n');

    // First, login as pharmacist
    console.log('1️⃣ Logging in as pharmacist...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'pharmacist@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Test pharmacy profile endpoint
    console.log('2️⃣ Testing GET /pharmacy/profile');
    try {
      const profileResponse = await axios.get(`${API_URL}/pharmacy/profile`, { headers });
      console.log('✅ Profile endpoint works!');
      console.log('   Pharmacy ID:', profileResponse.data.pharmacy._id);
      console.log('   Owner:', profileResponse.data.pharmacy.ownerName);
    } catch (error) {
      console.log('❌ Profile endpoint failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n3️⃣ Testing GET /pharmacy/products');
    try {
      const productsResponse = await axios.get(`${API_URL}/pharmacy/products`, { headers });
      console.log('✅ Products endpoint works!');
      console.log('   Found', productsResponse.data.medicines?.length || 0, 'medicines');
    } catch (error) {
      console.log('❌ Products endpoint failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n4️⃣ Testing GET /pharmacy/orders/pharmacy/list');
    try {
      const ordersResponse = await axios.get(`${API_URL}/pharmacy/orders/pharmacy/list`, { headers });
      console.log('✅ Orders endpoint works!');
      console.log('   Found', ordersResponse.data.orders?.length || 0, 'orders');
    } catch (error) {
      console.log('❌ Orders endpoint failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testPharmacyAPI();
