const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/icare')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const User = require('../models/user');
const Doctor = require('../models/doctor');

async function addTestDoctor() {
    try {
        console.log('\n🏥 Adding Test Doctor Account...\n');
        const existingUser = await User.findOne({ email: 'testdoctor@gmail.com' });
        
        if (existingUser) {
            console.log('⚠️  Doctor already exists!');
            console.log('📧 Email: testdoctor@gmail.com');
            console.log('🔑 Password: doctor123');
            console.log('\nYou can login with these credentials.');
            const doctorProfile = await Doctor.findOne({ user: existingUser._id });
            if (doctorProfile) {
                console.log('✅ Doctor profile exists');
            } else {
                console.log('⚠️  Creating doctor profile...');
                await Doctor.create({
                    user: existingUser._id,
                    specialization: 'General Practitioner',
                    degrees: ['MBBS', 'MD'],
                    experience: '5 years',
                    licenseNumber: 'DOC123456',
                    clinicName: 'Test Clinic',
                    clinicAddress: '123 Test Street, City',
                    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    availableTime: {
                        start: '09:00 AM',
                        end: '05:00 PM'
                    },
                    isApproved: true,
                });
                console.log('✅ Doctor profile created');
            }
            
            process.exit(0);
        }
        const hashedPassword = await bcrypt.hash('doctor123', 10);
        
        const newUser = await User.create({
            name: 'Dr. Test Doctor',
            email: 'testdoctor@gmail.com',
            password: hashedPassword,
            phoneNumber: '1234567890',
            role: 'Doctor'
        });

        console.log('✅ Doctor user created');
        console.log('📧 Email: testdoctor@gmail.com');
        console.log('🔑 Password: doctor123');
        const doctorProfile = await Doctor.create({
            user: newUser._id,
            specialization: 'General Practitioner',
            degrees: ['MBBS', 'MD'],
            experience: '5 years',
            licenseNumber: 'DOC123456',
            clinicName: 'Test Clinic',
            clinicAddress: '123 Test Street, City',
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            availableTime: {
                start: '09:00 AM',
                end: '05:00 PM'
            },
            isApproved: true,
        });

        console.log('✅ Doctor profile created');
        console.log('\n🎉 Test doctor account ready!');
        console.log('\nLogin credentials:');
        console.log('📧 Email: testdoctor@gmail.com');
        console.log('🔑 Password: doctor123');
        console.log('\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function checkExistingDoctors() {
    try {
        console.log('\n📋 Checking existing doctor accounts...\n');
        
        const doctors = await User.find({ role: 'Doctor' });
        
        if (doctors.length === 0) {
            console.log('⚠️  No doctors found in database');
        } else {
            console.log(`✅ Found ${doctors.length} doctor(s):\n`);
            for (const doc of doctors) {
                console.log(`📧 Email: ${doc.email}`);
                console.log(`👤 Name: ${doc.name}`);
                console.log(`🔑 Default Password: 123456 (if not changed)`);
                console.log('---');
            }
        }
        
        console.log('\n');
        await addTestDoctor();
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkExistingDoctors();
