const mongoose = require('mongoose');
const User = require('./models/user');
const Laboratory = require('./models/laboratory');
const LabBooking = require('./models/labBooking');

const MONGODB_URI = 'mongodb+srv://icaredev02_db_user:icaredev02@cluster0.kalraci.mongodb.net/?appName=Cluster0';

async function addAsifTestData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const labUser = await User.findOne({ email: 'asif@gmail.com' });

        if (!labUser) {
            console.log('❌ User asif@gmail.com not found');
            process.exit(1);
        }

        // Update or create laboratory profile
        let lab = await Laboratory.findOne({ user: labUser._id });

        const labData = {
            user: labUser._id,
            labName: 'Asif Advanced Diagnostics',
            ownerName: 'Asif Khan',
            licenseNumber: 'LAB-2024-ASIF-999',
            isApproved: true,
            labEmail: 'asif.diagnostics@gmail.com',
            labPhoneNumber: labUser.phoneNumber,
            address: '786 Health Avenue, Gulberg III',
            city: 'Lahore',
            location: {
                type: 'Point',
                coordinates: [74.34, 31.51]
            },
            workingHours: {
                from: '09:00 AM',
                to: '09:00 PM'
            },
            title: 'Precision Diagnostics for Better Health',
            description: 'Asif Advanced Diagnostics provides high-quality lab testing with the latest medical equipment.',
            testsOffered: [
                'Complete Blood Count (CBC)',
                'Lipid Profile',
                'Liver Function Test (LFT)',
                'Kidney Function Test (KFT)',
                'Thyroid Profile (T3, T4, TSH)',
                'HbA1c (Diabetes)',
                'Vitamin D Test',
                'COVID-19 Antibody Test',
                'Dengue PCR',
                'Hepatitis Panel'
            ],
            homeSampleAvailable: true,
        };

        if (lab) {
            console.log('📝 Updating laboratory profile for Asif...');
            await Laboratory.findByIdAndUpdate(lab._id, labData);
            console.log('✅ Laboratory profile updated');
        } else {
            console.log('📝 Creating laboratory profile for Asif...');
            lab = await Laboratory.create(labData);
            console.log('✅ Laboratory profile created');
        }

        // Ensure some patients exist
        let patients = await User.find({ role: 'Patient' });
        if (patients.length === 0) {
            console.log('📝 Creating test patients...');
            const patientData = [
                { name: 'Ali Hassan', email: 'ali@gmail.com', password: '123456', role: 'Patient', phoneNumber: '03011111111' },
                { name: 'Fatima Ahmed', email: 'fatima@gmail.com', password: '123456', role: 'Patient', phoneNumber: '03022222222' },
                { name: 'Usman Khan', email: 'usman@gmail.com', password: '123456', role: 'Patient', phoneNumber: '03033333333' }
            ];
            patients = await User.insertMany(patientData);
            console.log('✅ Test patients created');
        }

        // Create some test bookings if they don't exist
        await LabBooking.deleteMany({ laboratory: lab._id });
        console.log('🗑️  Cleared existing bookings for Asif');

        if (patients.length > 0) {
            const bookings = [];
            const tests = labData.testsOffered;
            const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            const now = new Date();

            for (let i = 0; i < 15; i++) {
                const patient = patients[i % patients.length];
                const testName = tests[i % tests.length];
                const status = statuses[i % statuses.length];

                const daysAgo = Math.floor(Math.random() * 10);
                const bookingDate = new Date(now);
                bookingDate.setDate(bookingDate.getDate() - daysAgo);

                bookings.push({
                    patient: patient._id,
                    laboratory: lab._id,
                    testName: testName,
                    date: bookingDate,
                    time: "10:00 AM",
                    status: status,
                    price: 1500 + Math.floor(Math.random() * 2000),
                    homeSample: Math.random() < 0.3,
                    notes: `Test booking for ${testName}`,
                    bookingNumber: `BK-ASIF-${Math.floor(100000 + Math.random() * 900000)}`
                });
            }

            await LabBooking.insertMany(bookings);
            console.log(`✅ Created ${bookings.length} test bookings for Asif`);
        }

        console.log('\n✅ Asif lab test data added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addAsifTestData();
