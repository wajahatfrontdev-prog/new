const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/user');
const Instructor = require('../models/instructor');
const InstructorCourse = require('../models/instructorCourse');
const InstructorPrecaution = require('../models/instructorPrecaution');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const instructorData = {
  email: 'instructor@test.com',
  password: 'instructor123',
  name: 'Dr. Sarah Johnson',
  phoneNumber: '+92-300-9876543',
  bio: 'Experienced mental health professional specializing in cognitive behavioral therapy and stress management.',
  qualification: 'PhD in Clinical Psychology',
  age: 38,
  gender: 'Female',
  address: '789 Wellness Avenue, Karachi',
  specialties: ['Cognitive Behavioral Therapy', 'Stress Management', 'Anxiety Treatment', 'Depression Counseling'],
  languages: ['English', 'Urdu', 'Hindi'],
  experience: '12 years',
  availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  availabilityTime: {
    start: '09:00',
    end: '17:00'
  },
  isVerified: true,
};

const coursesData = [
  {
    title: 'Introduction to Cognitive Behavioral Therapy',
    caption: 'Learn the fundamentals of CBT and how to apply them in daily life',
    videos: [
      { title: 'What is CBT?', url: 'https://example.com/video1' },
      { title: 'Core Principles of CBT', url: 'https://example.com/video2' },
      { title: 'Practical CBT Techniques', url: 'https://example.com/video3' },
    ],
    visibility: 'public',
  },
  {
    title: 'Stress Management Techniques',
    caption: 'Effective strategies to manage and reduce stress in your life',
    videos: [
      { title: 'Understanding Stress', url: 'https://example.com/video4' },
      { title: 'Relaxation Techniques', url: 'https://example.com/video5' },
      { title: 'Building Resilience', url: 'https://example.com/video6' },
    ],
    visibility: 'public',
  },
  {
    title: 'Anxiety Management Workshop',
    caption: 'Comprehensive guide to understanding and managing anxiety',
    videos: [
      { title: 'Types of Anxiety', url: 'https://example.com/video7' },
      { title: 'Coping Strategies', url: 'https://example.com/video8' },
      { title: 'Long-term Management', url: 'https://example.com/video9' },
    ],
    visibility: 'public',
  },
];

const precautionsData = [
  {
    title: 'Daily Mental Health Practices',
    body: 'Start your day with 10 minutes of mindfulness meditation. Practice gratitude by writing down three things you\'re thankful for. Take regular breaks during work to prevent burnout.',
    attachments: [],
  },
  {
    title: 'Managing Work-Life Balance',
    body: 'Set clear boundaries between work and personal time. Avoid checking work emails after hours. Schedule regular activities you enjoy. Prioritize sleep and maintain a consistent sleep schedule.',
    attachments: [],
  },
  {
    title: 'Recognizing Signs of Burnout',
    body: 'Watch for persistent fatigue, decreased motivation, irritability, and difficulty concentrating. If you notice these signs, take immediate action: reduce workload, seek support, and practice self-care.',
    attachments: [],
  },
];

async function addTestInstructor() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if user already exists
    let user = await User.findOne({ email: instructorData.email });
    
    if (!user) {
      // Create user account
      user = await User.create({
        name: instructorData.name,
        email: instructorData.email,
        password: instructorData.password,
        phoneNumber: instructorData.phoneNumber,
        role: 'Instructor',
      });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`ℹ️  User already exists: ${user.email}`);
    }

    // Check if instructor profile exists
    let instructor = await Instructor.findOne({ user: user._id });
    
    if (!instructor) {
      // Create instructor profile
      instructor = await Instructor.create({
        user: user._id,
        bio: instructorData.bio,
        qualification: instructorData.qualification,
        age: instructorData.age,
        gender: instructorData.gender,
        address: instructorData.address,
        specialties: instructorData.specialties,
        languages: instructorData.languages,
        experience: instructorData.experience,
        availabilityDays: instructorData.availabilityDays,
        availabilityTime: instructorData.availabilityTime,
        isVerified: instructorData.isVerified,
      });
      console.log(`✅ Created instructor profile: ${instructor._id}`);
    } else {
      console.log(`ℹ️  Instructor profile already exists`);
    }

    // Create courses
    console.log('\n📚 Creating courses...');
    for (const courseData of coursesData) {
      const existingCourse = await InstructorCourse.findOne({
        instructor: instructor._id,
        title: courseData.title,
      });

      if (!existingCourse) {
        const course = await InstructorCourse.create({
          instructor: instructor._id,
          ...courseData,
        });
        console.log(`  ✅ Created course: ${course.title}`);
      } else {
        console.log(`  ℹ️  Course already exists: ${courseData.title}`);
      }
    }

    // Create precautions
    console.log('\n💡 Creating precautions...');
    for (const precautionData of precautionsData) {
      const existingPrecaution = await InstructorPrecaution.findOne({
        instructor: instructor._id,
        title: precautionData.title,
      });

      if (!existingPrecaution) {
        const precaution = await InstructorPrecaution.create({
          instructor: instructor._id,
          ...precautionData,
        });
        console.log(`  ✅ Created precaution: ${precaution.title}`);
      } else {
        console.log(`  ℹ️  Precaution already exists: ${precautionData.title}`);
      }
    }

    console.log('\n✅ Test instructor setup complete!');
    console.log('\n📋 Test Instructor Credentials:');
    console.log(`   Email: ${instructorData.email}`);
    console.log(`   Password: ${instructorData.password}`);
    console.log(`   Name: ${instructorData.name}`);
    console.log(`   Specialties: ${instructorData.specialties.join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestInstructor();
