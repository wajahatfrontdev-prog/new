const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('../models/notification');
const User = require('../models/user');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const addTestNotifications = async () => {
  try {
    await connectDB();

    // Find the amaan@gmail.com doctor user
    const doctor = await User.findOne({ email: 'amaan@gmail.com', role: 'Doctor' });
    
    if (!doctor) {
      console.log('❌ Doctor with email amaan@gmail.com not found.');
      console.log('💡 Looking for any doctor account...');
      
      const anyDoctor = await User.findOne({ role: 'Doctor' });
      if (!anyDoctor) {
        console.log('❌ No doctor accounts found in database.');
        process.exit(1);
      }
      
      console.log(`📋 Using doctor: ${anyDoctor.name} (${anyDoctor.email})`);
      await createNotifications(anyDoctor);
    } else {
      console.log(`📋 Adding test notifications for doctor: ${doctor.name} (${doctor.email})`);
      await createNotifications(doctor);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

const createNotifications = async (doctor) => {
  // Clear existing notifications for this doctor
  await Notification.deleteMany({ user: doctor._id });
  console.log('🗑️  Cleared existing notifications');

  // Create test notifications
  const notifications = [
    {
      user: doctor._id,
      type: 'appointment',
      title: 'New Appointment Request',
      message: 'Kinza Khurram has requested an appointment for March 15, 2026',
      read: false,
    },
    {
      user: doctor._id,
      type: 'cancellation',
      title: 'Appointment Cancelled',
      message: 'Patient John Doe cancelled appointment scheduled for today',
      read: false,
    },
    {
      user: doctor._id,
      type: 'reminder',
      title: 'Upcoming Appointment',
      message: 'You have an appointment with Sarah Johnson in 30 minutes',
      read: true,
    },
    {
      user: doctor._id,
      type: 'review',
      title: 'New Review Received',
      message: 'Patient rated you 5 stars with positive feedback',
      read: true,
    },
    {
      user: doctor._id,
      type: 'general',
      title: 'System Update',
      message: 'New features have been added to your dashboard',
      read: false,
    },
  ];

  const created = await Notification.insertMany(notifications);
  console.log(`✅ Created ${created.length} test notifications`);

  console.log('\n📊 Notification Summary:');
  console.log(`   Doctor: ${doctor.name}`);
  console.log(`   Email: ${doctor.email}`);
  console.log(`   Total Notifications: ${created.length}`);
  console.log(`   Unread: ${created.filter(n => !n.read).length}`);
  console.log(`   Read: ${created.filter(n => n.read).length}`);
};

addTestNotifications();
