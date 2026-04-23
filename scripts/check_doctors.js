const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('../models/doctor');
const User = require('../models/user');

async function checkDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const doctors = await Doctor.find().populate('user', 'name email role');
        console.log(`📋 Total doctors in database: ${doctors.length}\n`);

        doctors.forEach((doc, index) => {
            console.log(`Doctor ${index + 1}:`);
            console.log(`  ID: ${doc._id}`);
            console.log(`  User: ${doc.user?.name} (${doc.user?.email})`);
            console.log(`  Specialization: ${doc.specialization || 'Not set'}`);
            console.log(`  Degrees: ${doc.degrees?.join(', ') || 'Not set'}`);
            console.log(`  Experience: ${doc.experience || 'Not set'}`);
            console.log(`  License: ${doc.licenseNumber || 'Not set'}`);
            console.log(`  Clinic: ${doc.clinicName || 'Not set'}`);
            console.log(`  Available Days: ${doc.availableDays?.join(', ') || 'Not set'}`);
            console.log(`  Available Time: ${doc.availableTime?.start || 'Not set'} - ${doc.availableTime?.end || 'Not set'}`);
            console.log('---');
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDoctors();
