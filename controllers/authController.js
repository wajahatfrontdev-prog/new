const User = require("../models/user");
const Doctor = require("../models/doctor");
const Pharmacy = require("../models/pharmacy");
const Laboratory = require("../models/laboratory");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendVerificationEmail, sendWelcomeEmail } = require("../services/emailService");

exports.registerUser = async (req, res) => {
  try {
    console.log("Register request:", req.body);

    const {
      name, email, password, role, phoneNumber,
      licenseNumber, location, organizationName, credentials
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please add all required fields",
      });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const isControlledRole = ['Laboratory', 'Pharmacy', 'Instructor', 'Student'].includes(role);
    const isApproved = !isControlledRole;

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Patient",
      phoneNumber: phoneNumber || "",
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
      isEmailVerified: false,
      isApproved: isApproved,
      verificationDetails: isControlledRole ? {
        licenseNumber: licenseNumber || "",
        location: location || "",
        organizationName: organizationName || "",
        credentials: credentials || "",
        submittedAt: Date.now()
      } : undefined
    });

    console.log("User created:", user._id, "- Approved:", isApproved);

    // Auto-create Doctor profile so they appear in patient's doctors list immediately
    if (user.role === 'Doctor') {
      try {
        await Doctor.create({
          user: user._id,
          specialization: 'General Practitioner',
          degrees: [],
          experience: '',
          licenseNumber: '',
          clinicName: '',
          clinicAddress: '',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTime: { start: '09:00', end: '17:00' },
          isApproved: true,
          ratings: [],
          reviews: [],
        });
        console.log("✅ Doctor profile auto-created for:", user._id);
      } catch (docErr) {
        console.warn("⚠️ Could not auto-create doctor profile:", docErr.message);
      }
    }

    // Auto-create Laboratory profile
    if (user.role === 'Laboratory') {
      try {
        await Laboratory.create({
          user: user._id,
          labName: name || 'Laboratory',
          ownerName: name || '',
          licenseNumber: licenseNumber || '',
          labEmail: email,
          labPhoneNumber: phoneNumber || '',
          address: location || '',
          city: '',
          location: null,
          workingHours: { start: '09:00', end: '17:00' },
          testsOffered: [],
          availableTests: [],
          homeSampleAvailable: false,
          isApproved: false,
          ratings: [],
          reviews: [],
        });
        console.log("✅ Laboratory profile auto-created for:", user._id);
      } catch (labErr) {
        console.warn("⚠️ Could not auto-create laboratory profile:", labErr.message);
      }
    }

    // Auto-create Pharmacy profile
    if (user.role === 'Pharmacy') {
      try {
        const Pharmacy = require("../models/pharmacy");
        await Pharmacy.create({
          user: user._id,
          pharmacyName: name || 'Pharmacy',
          ownerName: name || '',
          licenseNumber: licenseNumber || '',
          pharmacyEmail: email,
          pharmacyPhoneNumber: phoneNumber || '',
          address: location || '',
          city: '',
          location: null,
          workingHours: { start: '09:00', end: '21:00' },
          products: [],
          isApproved: false,
          ratings: [],
          reviews: [],
        });
        console.log("✅ Pharmacy profile auto-created for:", user._id);
      } catch (pharmErr) {
        console.warn("⚠️ Could not auto-create pharmacy profile:", pharmErr.message);
      }
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log("✅ Verification email sent to:", user.email);
    } catch (emailErr) {
      console.error("⚠️ Failed to send verification email:", emailErr.message);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isApproved: user.isApproved,
      token: user.isApproved ? generateToken(user._id) : null,
      message: user.isApproved
        ? "Registration successful. Please check your email to verify your account."
        : "Registration successful. Your account is pending admin approval.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.isApproved) {
      console.log("❌ LOGIN FAILED (Pending Approval):", email);
      return res.status(403).json({ message: "Account is pending admin verification" });
    }

    console.log("✅ USER LOGGED IN:");
    console.log("   Name:", user.name);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);
    console.log("   Time:", new Date().toLocaleString());
    console.log("-----------------------------------");

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    console.log("❌ LOGIN FAILED:", email);
    res.status(401).json({ message: "Invalid credentials" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    return res.json({
      message: "OTP sent to your email",
      body: user,
      otp: otp,
    });
  } catch (error) {
    console.error("Error in forgetPassword:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.conformationPassword = async (req, res) => {
  try {
    const { code, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }
    if (!user.resetOTP) {
      return res
        .status(400)
        .json({ error: "OTP not generated for this email" });
    }
    if (parseInt(code) !== user.resetOTP) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }
    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in checkCode:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    user.password = password;
    user.resetOTP = undefined;
    user.otpExpiry = undefined;

    await user.save();

    console.log("✅ PASSWORD RESET SUCCESSFUL:");
    console.log("   Email:", user.email);
    console.log("   Time:", new Date().toLocaleString());
    console.log("-----------------------------------");

    return res.json({ message: "Reset Password Successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name, user.role);
      console.log("✅ Welcome email sent to:", user.email);
    } catch (emailErr) {
      console.error("⚠️ Failed to send welcome email:", emailErr.message);
    }

    console.log("✅ EMAIL VERIFIED:");
    console.log("   Email:", user.email);
    console.log("   Time:", new Date().toLocaleString());
    console.log("-----------------------------------");

    return res.json({
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log("✅ Verification email resent to:", user.email);
    } catch (emailErr) {
      console.error("⚠️ Failed to resend verification email:", emailErr.message);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    return res.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error in resendVerificationEmail:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
