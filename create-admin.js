const mongoose = require('mongoose');
const User = require('./models/user');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/icare');
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@icare.com';
        const adminPassword = 'adminpassword123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        const admin = new User({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'Admin',
            isApproved: true,
            isEmailVerified: true
        });

        await admin.save();

        console.log('-----------------------------------');
        console.log('✅ Admin User Created Successfully');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
