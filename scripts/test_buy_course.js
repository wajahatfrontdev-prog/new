const axios = require('axios');

// Test buying a course
async function testBuyCourse() {
  try {
    // First, login to get a token
    console.log('1. Logging in as student...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'kinza@gmail.com',  // Replace with actual student email
      password: 'kinza123'        // Replace with actual password
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful, token:', token.substring(0, 20) + '...');
    
    // Get list of courses
    console.log('\n2. Getting list of courses...');
    const coursesResponse = await axios.get('http://localhost:5000/api/students/courses');
    console.log('✓ Found', coursesResponse.data.courses.length, 'courses');
    
    if (coursesResponse.data.courses.length > 0) {
      const firstCourse = coursesResponse.data.courses[0];
      console.log('   First course:', firstCourse.title, '(ID:', firstCourse._id, ')');
      
      // Try to buy the course
      console.log('\n3. Attempting to buy course...');
      try {
        const buyResponse = await axios.post(
          'http://localhost:5000/api/students/courses/enrollments',
          { courseId: firstCourse._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ Course purchased successfully!');
        console.log('   Enrollment:', buyResponse.data);
      } catch (buyError) {
        console.log('✗ Error buying course:');
        console.log('   Status:', buyError.response?.status);
        console.log('   Message:', buyError.response?.data?.message || buyError.message);
        console.log('   Full error:', buyError.response?.data);
      }
    } else {
      console.log('✗ No courses available to test');
    }
    
  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
  }
}

testBuyCourse();
