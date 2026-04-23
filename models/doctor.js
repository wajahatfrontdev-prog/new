const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialization: String,
  consultationType: { type: String, enum: ["InPerson", "Online", "Both"] },
  languages: [String],
  degrees: [String],
  experience: String,
  licenseNumber: String,
  clinicName: String,
  clinicAddress: String,
  availability: {
    availableDays: [String],
    availableTime: {
      start: String,
      end: String,
    },
    unavailableDates: [Date],
    bufferTime: { type: Number, default: 15 }, // Buffer time in minutes (Req 33.14)
    emergencySlots: { type: Boolean, default: false }, // Allow emergency slots (Req 33.9)
  },
  isApproved: { type: Boolean, default: false },
  ratings: [Number],
  reviews: [String],
  age: [Number],
  bio: [String],
});

module.exports = mongoose.model("Doctor", doctorSchema);
