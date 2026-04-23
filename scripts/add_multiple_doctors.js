require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Doctor = require('../models/doctor');

const MONGO_URI = process.env.MONGO_URI;

const doctors = [
  {
    email: 'dr.sarah.johnson@hospital.com',
    password: 'doctor123',
    name: 'Dr. Sarah Johnson',
    phoneNumber: '+1234567890',
    specialization: 'Cardiologist',
    consultationType: 'Both',
    languages: ['English', 'Spanish'],
    degrees: ['MBBS', 'MD Cardiology'],
    experience: '15 years',
    licenseNumber: 'MED-2008-12345',
    clinicName: 'Heart Care Center',
    clinicAddress: '123 Medical Plaza, New York, NY 10001',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableTime: { start: '09:00', end: '17:00' }
  },
  {
    email: 'dr.michael.chen@hospital.com',
    password: 'doctor123',
    name: 'Dr. Michael Chen',
    phoneNumber: '+1234567891',
    specialization: 'Pediatrician',
    consultationType: 'Both',
    languages: ['English', 'Mandarin'],
    degrees: ['MBBS', 'MD Pediatrics'],
    experience: '12 years',
    licenseNumber: 'MED-2011-23456',
    clinicName: 'Kids Health Clinic',
    clinicAddress: '456 Children Ave, Los Angeles, CA 90001',
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableTime: { start: '08:00', end: '16:00' }
  },
  {
    email: 'dr.emily.rodriguez@hospital.com',
    password: 'doctor123',
    name: 'Dr. Emily Rodriguez',
    phoneNumber: '+1234567892',
    specialization: 'Dermatologist',
    consultationType: 'Both',
    languages: ['English', 'Spanish', 'Portuguese'],
    degrees: ['MBBS', 'MD Dermatology', 'Fellowship in Cosmetic Dermatology'],
    experience: '10 years',
    licenseNumber: 'MED-2013-34567',
    clinicName: 'Skin Care Specialists',
    clinicAddress: '789 Beauty Blvd, Miami, FL 33101',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableTime: { start: '10:00', end: '18:00' }
  },
  {
    email: 'dr.james.wilson@hospital.com',
    password: 'doctor123',
    name: 'Dr. James Wilson',
    phoneNumber: '+1234567893',
    specialization: 'Orthopedic Surgeon',
    consultationType: 'InPerson',
    languages: ['English'],
    degrees: ['MBBS', 'MS Orthopedics'],
    experience: '20 years',
    licenseNumber: 'MED-2003-45678',
    clinicName: 'Bone & Joint Institute',
    clinicAddress: '321 Sports Medicine Dr, Chicago, IL 60601',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    availableTime: { start: '09:00', end: '17:00' }
  },
  {
    email: 'dr.priya.patel@hospital.com',
    password: 'doctor123',
    name: 'Dr. Priya Patel',
    phoneNumber: '+1234567894',
    specialization: 'Gynecologist',
    consultationType: 'Both',
    languages: ['English', 'Hindi', 'Gujarati'],
    degrees: ['MBBS', 'MD Obstetrics & Gynecology'],
    experience: '14 years',
    licenseNumber: 'MED-2009-56789',
    clinicName: 'Women\'s Health Center',
    clinicAddress: '555 Wellness Way, Houston, TX 77001',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableTime: { start: '08:30', end: '17:30' }
  },
  {
    email: 'dr.david.kim@hospital.com',
    password: 'doctor123',
    name: 'Dr. David Kim',
    phoneNumber: '+1234567895',
    specialization: 'Neurologist',
    consultationType: 'Both',
    languages: ['English', 'Korean'],
    degrees: ['MBBS', 'MD Neurology', 'Fellowship in Epilepsy'],
    experience: '18 years',
    licenseNumber: 'MED-2005-67890',
    clinicName: 'Brain & Spine Clinic',
    clinicAddress: '888 Neuro Center, San Francisco, CA 94101',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableTime: { start: '09:00', end: '16:00' }
  },
  {
    email: 'dr.lisa.anderson@hospital.com',
    password: 'doctor123',
    name: 'Dr. Lisa Anderson',
    phoneNumber: '+1234567896',
    specialization: 'Psychiatrist',
    consultationType: 'Online',
    languages: ['English', 'French'],
    degrees: ['MBBS', 'MD Psychiatry'],
    experience: '11 years',
    licenseNumber: 'MED-2012-78901',
    clinicName: 'Mental Wellness Center',
    clinicAddress: '999 Peace St, Seattle, WA 98101',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableTime: { start: '10:00', end: '19:00' }
  },
  {
    email: 'dr.robert.brown@hospital.com',
    password: 'doctor123',
    name: 'Dr. Robert Brown',
    phoneNumber: '+1234567897',
    specialization: 'General Physician',
    consultationType: 'Both',
    languages: ['English'],
    degrees: ['MBBS', 'MD Internal Medicine'],
    experience: '25 years',
    licenseNumber: 'MED-1998-89012',
    clinicName: 'Family Health Clinic',
    clinicAddress: '111 Main Street, Boston, MA 02101',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableTime: { start: '08:00', end: '18:00' }
  }
];

async function addDoctors() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const doctorData of doctors) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: doctorData.email });
      if (existingUser) {
        console.log(`User ${doctorData.email} already exists, skipping...`);
        continue;
      }

      // Create user
      const hashedPassword = await bcrypt.hash(doctorData.password, 10);
      const user = await User.create({
        name: doctorData.name,
        email: doctorData.email,
        password: hashedPassword,
        phoneNumber: doctorData.phoneNumber,
        role: 'Doctor'
      });

      // Create doctor profile
      const doctor = await Doctor.create({
        user: user._id,
        specialization: doctorData.specialization,
        consultationType: doctorData.consultationType,
        languages: doctorData.languages,
        degrees: doctorData.degrees,
        experience: doctorData.experience,
        licenseNumber: doctorData.licenseNumber,
        clinicName: doctorData.clinicName,
        clinicAddress: doctorData.clinicAddress,
        availableDays: doctorData.availableDays,
        availableTime: doctorData.availableTime,
        isApproved: true,
        ratings: [4.5, 4.8, 5.0, 4.7, 4.9],
        reviews: []
      });

      console.log(`✅ Created doctor: ${doctorData.name} (${doctorData.specialization})`);
    }

    console.log('\n🎉 All doctors added successfully!');
    console.log('\nTest Credentials:');
    console.log('Email: [any doctor email above]');
    console.log('Password: doctor123');
    console.log('\nDoctors List:');
    doctors.forEach(d => console.log(`- ${d.name} (${d.specialization}) - ${d.email}`));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error adding doctors:', error);
    process.exit(1);
  }
}

addDoctors();
