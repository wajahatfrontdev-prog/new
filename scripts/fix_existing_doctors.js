const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/icare')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

const User = require('../models/user');
const Doctor = require('../models/doctor');

async function fixExistingDoctors() {
    try {
        console.log('\n🔧 Fixing existing doctor accounts...\n');

        const doctorUsers = await User.find({ role: 'Doctor' });
        
        console.log(`Found ${doctorUsers.length} doctor user(s)\n`);

        for (const user of doctorUsers) {
            const existingProfile = await Doctor.findOne({ user: user._id });
            
            if (existingProfile) {
                console.log(`✅ ${user.name} (${user.email}) - Profile exists`);
            } else {
                console.log(`⚠️  ${user.name} (${user.email}) - Creating profile...`);
                
                await Doctor.create({
                    user: user._id,
                    specialization: 'General Practitioner',
                    degrees: [],
                    experience: '',
                    licenseNumber: '',
                    clinicName: '',
                    clinicAddress: '',
                    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    availableTime: {
                        start: '09:00 AM',
                        end: '05:00 PM'
                    },
                    isApproved: true,
                    ratings: [],
                    reviews: []
                });
                
                console.log(`   ✅ Profile created for ${user.name}`);
            }
        }

        console.log('\n🎉 All doctor accounts fixed!');
        console.log('\nDoctors can now:');
        console.log('1. Be seen in the doctors list by patients');
        console.log('2. Receive appointment bookings');
        console.log('3. Update their profile with specialization, clinic info, etc.\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
setTimeout(fixExistingDoctors, 1000);
