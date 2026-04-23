const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");
const MedicalRecord = require("./models/medicalRecord");

const run = async () => {
    await connectDB();
    const records = await MedicalRecord.find().populate("assignedCourses");
    console.log(JSON.stringify(records.map(r => r.assignedCourses), null, 2));
    process.exit(0);
}
run();
