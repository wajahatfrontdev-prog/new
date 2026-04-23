const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user');
const Student = require('../models/student');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const createTestStudent = async () => {
  try {
    await connectDB();

    // Check if student already exists
    let user = await User.findOne({ email: 'student@test.com' });
    
    if (user) {
      console.log('✓ Student user already exists');
    } else {
      // Create student user
      const hashedPassword = await bcrypt.hash('student123', 10);
      user = await User.create({
        name: 'Alex Student',
        email: 'student@test.com',
        password: hashedPassword,
        phoneNumber: '+1234567890',
        role: 'Student',
      });
      console.log('✓ Student user created');
    }

    // Check if student profile exists
    let studentProfile = await Student.findOne({ user: user._id });
    
    if (studentProfile) {
      console.log('✓ Student profile already exists');
    } else {
      // Create student profile
      studentProfile = await Student.create({
        user: user._id,
        bio: 'Passionate learner interested in healthcare and medical sciences. Currently pursuing advanced courses in behavioral therapy and child psychology.',
        qualification: 'Bachelor of Science in Psychology',
        age: 24,
        gender: 'Male',
        address: '123 University Ave, Student City, SC 12345',
        dateOfBirth: new Date('1999-05-15'),
        educationLevel: 'Undergraduate',
        enrolledCourses: [],
        preferences: ['Behavioral Therapy', 'Child Psychology', 'Mental Health'],
        isVerified: true,
      });
      console.log('✓ Student profile created');
    }

    console.log('\n📋 Student Credentials:');
    console.log('   Email: student@test.com');
    console.log('   Password: student123');
    console.log('   Role: student');
    console.log(`   User ID: ${user._id}`);
    console.log(`   Profile ID: ${studentProfile._id}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
};

createTestStudent();
