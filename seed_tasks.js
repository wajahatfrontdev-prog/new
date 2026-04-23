const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/task');
const User = require('./models/user');

dotenv.config();

async function seedTasks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const asif = await User.findOne({ email: 'asif@gmail.com' });
        if (!asif) {
            console.log('Asif user not found');
            return;
        }

        const admin = await User.findOne({ role: 'admin' }) || asif;

        const sampleTasks = [
            {
                title: 'Calibrate Blood Analyzer',
                description: 'The Sysmex analyzer needs monthly calibration and QC check.',
                assignedTo: asif._id,
                assignedBy: admin._id,
                dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
                priority: 'High',
                status: 'Assigned'
            },
            {
                title: 'Review Inventory',
                description: 'Check stock of reagents for Glucose and Lipid profile tests.',
                assignedTo: asif._id,
                assignedBy: admin._id,
                dueDate: new Date(Date.now() + 86400000 * 5),
                priority: 'Medium',
                status: 'In Progress'
            },
            {
                title: 'Patient Callback - Alyana',
                description: 'Explain the high cholesterol results to the patient and suggest follow up with a cardiologist.',
                assignedTo: asif._id,
                assignedBy: admin._id,
                dueDate: new Date(),
                priority: 'High',
                status: 'In Progress'
            },
            {
                title: 'Submit Weekly Report',
                description: 'Compile the test volume report for the week ending Oct 15.',
                assignedTo: asif._id,
                assignedBy: admin._id,
                dueDate: new Date(),
                status: 'Completed',
                priority: 'Low',
                completedAt: new Date()
            }
        ];

        await Task.deleteMany({ assignedTo: asif._id });
        await Task.insertMany(sampleTasks);

        console.log('Sample tasks seeded for asif@gmail.com');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedTasks();
