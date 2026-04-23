const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { SubscriptionPlan } = require('../models/subscription');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const plans = [
  {
    name: 'Basic Care',
    type: 'Basic',
    price: 999,
    duration: 1,
    features: [
      { name: 'Online Consultations', description: 'Access to general physicians', included: true },
      { name: 'Digital Health Records', description: 'Store and access your medical history', included: true },
      { name: 'Appointment Booking', description: 'Book appointments anytime', included: true }
    ],
    benefits: {
      discountedConsultations: 10,
      freeLabTests: 0,
      priorityBooking: false,
      freeHealthPrograms: 1,
      familyMembers: 1
    }
  },
  {
    name: 'Premium Health',
    type: 'Premium',
    price: 2499,
    duration: 1,
    features: [
      { name: 'All Basic Features', description: 'Everything in Basic plan', included: true },
      { name: 'Specialist Consultations', description: 'Access to specialist doctors', included: true },
      { name: 'Priority Booking', description: 'Get appointments faster', included: true },
      { name: 'Free Lab Tests', description: '2 free lab tests per month', included: true }
    ],
    benefits: {
      discountedConsultations: 20,
      freeLabTests: 2,
      priorityBooking: true,
      freeHealthPrograms: 3,
      familyMembers: 1
    }
  },
  {
    name: 'Family Care',
    type: 'Family',
    price: 4999,
    duration: 1,
    features: [
      { name: 'All Premium Features', description: 'Everything in Premium plan', included: true },
      { name: 'Family Coverage', description: 'Up to 4 family members', included: true },
      { name: 'Unlimited Health Programs', description: 'Access all educational content', included: true },
      { name: 'Monthly Health Checkup', description: 'Comprehensive health monitoring', included: true }
    ],
    benefits: {
      discountedConsultations: 25,
      freeLabTests: 4,
      priorityBooking: true,
      freeHealthPrograms: 999,
      familyMembers: 4
    }
  },
  {
    name: 'Diabetes Care',
    type: 'Chronic Care',
    price: 3499,
    duration: 1,
    features: [
      { name: 'Specialized Care', description: 'Diabetes specialist consultations', included: true },
      { name: 'Regular Monitoring', description: 'Monthly blood sugar tracking', included: true },
      { name: 'Diet Plans', description: 'Personalized nutrition guidance', included: true },
      { name: 'Free Lab Tests', description: '3 diabetes-related tests per month', included: true }
    ],
    benefits: {
      discountedConsultations: 30,
      freeLabTests: 3,
      priorityBooking: true,
      freeHealthPrograms: 5,
      familyMembers: 1
    }
  },
  {
    name: 'Preventive Health',
    type: 'Preventive',
    price: 1999,
    duration: 1,
    features: [
      { name: 'Annual Checkup', description: 'Comprehensive health screening', included: true },
      { name: 'Vaccination Reminders', description: 'Stay up to date with immunizations', included: true },
      { name: 'Health Programs', description: 'Access to wellness content', included: true },
      { name: 'Lifestyle Tracking', description: 'Monitor your daily health activities', included: true }
    ],
    benefits: {
      discountedConsultations: 15,
      freeLabTests: 1,
      priorityBooking: false,
      freeHealthPrograms: 5,
      familyMembers: 1
    }
  }
];

const seedPlans = async () => {
  try {
    await connectDB();

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing plans');

    // Insert new plans
    const createdPlans = await SubscriptionPlan.insertMany(plans);
    console.log(`✅ Created ${createdPlans.length} subscription plans`);

    createdPlans.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.type}): PKR ${plan.price}/${plan.duration} month(s)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
