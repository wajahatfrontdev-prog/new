const mongoose = require('mongoose');
require('dotenv').config();

const MedicalRecord = require('../models/medicalRecord');
const User = require('../models/user');
const Appointment = require('../models/appointment');

const addMedicalRecords = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const doctor = await User.findOne({ email: 'amaan@gmail.com' });
        const patient = await User.findOne({ email: 'kinza@gmail.com' });

        if (!doctor) {
            console.log('❌ Doctor amaan@gmail.com not found. Please create this account first.');
            process.exit(1);
        }

        if (!patient) {
            console.log('❌ Patient kinza@gmail.com not found. Please create this account first.');
            process.exit(1);
        }

        console.log(`\n👨‍⚕️ Doctor: ${doctor.name} (${doctor.email})`);
        console.log(`👤 Patient: ${patient.name} (${patient.email})`);

        const appointment = await Appointment.findOne({
            doctor: doctor._id,
            patient: patient._id
        });

        if (appointment) {
            console.log(`📅 Found appointment: ${appointment._id}`);
        }

        const sampleRecords = [
            {
                patient: patient._id,
                doctor: doctor._id,
                appointment: appointment?._id,
                diagnosis: 'Common Cold with Mild Fever',
                symptoms: ['Runny nose', 'Sore throat', 'Mild fever (100.4°F)', 'Fatigue', 'Headache'],
                prescription: {
                    medicines: [
                        {
                            name: 'Paracetamol',
                            dosage: '500mg',
                            frequency: 'Twice daily',
                            duration: '5 days',
                            instructions: 'Take after meals'
                        },
                        {
                            name: 'Cetirizine',
                            dosage: '10mg',
                            frequency: 'Once daily',
                            duration: '7 days',
                            instructions: 'Take before bedtime'
                        }
                    ],
                    notes: 'Complete the full course'
                },
                labTests: ['Complete Blood Count (CBC)', 'Throat Swab Culture'],
                vitalSigns: {
                    bloodPressure: '120/80',
                    temperature: '100.4',
                    heartRate: '78',
                    weight: '65',
                    height: '165'
                },
                notes: 'Patient advised to rest and stay hydrated. Avoid cold beverages. Follow up if symptoms persist beyond 7 days.',
                followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                patient: patient._id,
                doctor: doctor._id,
                appointment: appointment?._id,
                diagnosis: 'Migraine Headache',
                symptoms: ['Severe headache', 'Sensitivity to light', 'Nausea', 'Visual disturbances'],
                prescription: {
                    medicines: [
                        {
                            name: 'Sumatriptan',
                            dosage: '50mg',
                            frequency: 'As needed',
                            duration: '30 days',
                            instructions: 'Take at onset of migraine. Max 2 doses per day'
                        },
                        {
                            name: 'Ibuprofen',
                            dosage: '400mg',
                            frequency: 'As needed',
                            duration: '30 days',
                            instructions: 'Take with food'
                        }
                    ],
                    notes: 'Avoid triggers'
                },
                labTests: ['CT Scan - Brain', 'Blood Pressure Monitoring'],
                vitalSigns: {
                    bloodPressure: '125/82',
                    temperature: '98.6',
                    heartRate: '75',
                    weight: '65',
                    height: '165'
                },
                notes: 'Patient advised to maintain a headache diary, avoid triggers (stress, certain foods), ensure adequate sleep and hydration.',
                followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                patient: patient._id,
                doctor: doctor._id,
                appointment: appointment?._id,
                diagnosis: 'Vitamin D Deficiency',
                symptoms: ['Bone pain', 'Muscle weakness', 'Fatigue', 'Mood changes'],
                prescription: {
                    medicines: [
                        {
                            name: 'Vitamin D3',
                            dosage: '60,000 IU',
                            frequency: 'Once weekly',
                            duration: '8 weeks',
                            instructions: 'Take with milk or after a fatty meal'
                        },
                        {
                            name: 'Calcium Carbonate',
                            dosage: '500mg',
                            frequency: 'Twice daily',
                            duration: '60 days',
                            instructions: 'Take with meals'
                        }
                    ],
                    notes: 'Monitor vitamin D levels'
                },
                labTests: ['Vitamin D Level Test', 'Calcium Level', 'Bone Density Scan'],
                vitalSigns: {
                    bloodPressure: '118/76',
                    temperature: '98.4',
                    heartRate: '72',
                    weight: '65',
                    height: '165'
                },
                notes: 'Patient should get 15-20 minutes of sunlight exposure daily. Include vitamin D rich foods like fish, eggs, and fortified milk.',
                followUpDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            }
        ];

        console.log('\n📋 Creating medical records...');
        
        for (let i = 0; i < sampleRecords.length; i++) {
            const record = await MedicalRecord.create(sampleRecords[i]);
            console.log(`✅ Record ${i + 1} created: ${record.diagnosis}`);
        }

        console.log('\n✅ All medical records created successfully!');
        console.log('\n📝 Summary:');
        console.log(`   - Doctor: ${doctor.name} (${doctor.email})`);
        console.log(`   - Patient: ${patient.name} (${patient.email})`);
        console.log(`   - Records created: ${sampleRecords.length}`);
        console.log('\n🔍 How to test:');
        console.log('   1. Login as doctor: amaan@gmail.com');
        console.log('   2. Go to "Patient Records" from sidebar/drawer');
        console.log(`   3. Search for patient: ${patient.name}`);
        console.log('   4. Click on patient to view their medical records');
        console.log('   5. Click on any record to view full details');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addMedicalRecords();
