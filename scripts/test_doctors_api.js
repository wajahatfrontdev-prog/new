const axios = require('axios');

async function testDoctorsAPI() {
  try {
    console.log('🔍 Testing doctors API...');
    const response = await axios.get('http://localhost:5000/api/doctors/get_all_doctors');
    
    console.log('✅ Status:', response.status);
    console.log('✅ Total doctors:', response.data.doctors?.length || 0);
    
    if (response.data.doctors && response.data.doctors.length > 0) {
      console.log('\n📋 First doctor sample:');
      console.log(JSON.stringify(response.data.doctors[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testDoctorsAPI();
