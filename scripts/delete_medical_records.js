const mongoose = require('mongoose');
require('dotenv').config();

const MedicalRecord = require('../models/medicalRecord');

const deleteRecords = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const result = await MedicalRecord.deleteMany({});
        console.log(`🗑️  Deleted ${result.deletedCount} medical records`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

deleteRecords();
