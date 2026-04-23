const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    otpExpiry: {
      type: Date,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
      default: '',
    },
    fcmToken: {
      type: String,
      required: false,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: [
        "Patient",
        "Doctor",
        "Pharmacy",
        "Laboratory",
        "Instructor",
        "Student",
        "Admin",
      ],
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      required: false,
    },
    emailVerificationExpiry: {
      type: Date,
      required: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    biometricEnabled: {
      type: Boolean,
      default: false,
    },
    verificationDetails: {
      licenseNumber: { type: String, default: "" },
      location: { type: String, default: "" },
      organizationName: { type: String, default: "" },
      credentials: { type: String, default: "" },
      submittedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(8);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);
