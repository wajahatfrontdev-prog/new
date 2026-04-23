const User = require("../models/user");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    
    console.log(`📋 Fetched ${users.length} users from database`);
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalUsers = await User.countDocuments();
    
    res.json({
      success: true,
      totalUsers,
      byRole: stats
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

const Doctor = require("../models/doctor");
const bcrypt = require("bcryptjs");

exports.getAllDoctorsTest = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email role phoneNumber');
    
    console.log(`📋 Fetched ${doctors.length} doctors from database`);
    
    res.json({
      success: true,
      count: doctors.length,
      doctors: doctors
    });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

exports.createSampleDoctors = async (req, res) => {
  try {
    const doctorUsers = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@hospital.com",
        password: await bcrypt.hash("doctor123", 10),
        phoneNumber: "03001234567",
        role: "Doctor"
      },
      {
        name: "Dr. Michael Chen",
        email: "michael.chen@hospital.com",
        password: await bcrypt.hash("doctor123", 10),
        phoneNumber: "03001234568",
        role: "Doctor"
      },
      {
        name: "Dr. Emily Williams",
        email: "emily.williams@hospital.com",
        password: await bcrypt.hash("doctor123", 10),
        phoneNumber: "03001234569",
        role: "Doctor"
      },
      {
        name: "Dr. Ahmed Khan",
        email: "ahmed.khan@hospital.com",
        password: await bcrypt.hash("doctor123", 10),
        phoneNumber: "03001234570",
        role: "Doctor"
      }
    ];

    const createdUsers = [];
    for (const userData of doctorUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`✅ Created doctor user: ${user.name}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`ℹ️ Doctor user already exists: ${existingUser.name}`);
      }
    }

    const doctorProfiles = [
      {
        user: createdUsers[0]._id,
        specialization: "Cardiology",
        degrees: ["MBBS", "MD Cardiology"],
        experience: "10 years",
        licenseNumber: "PMC-12345",
        clinicName: "Heart Care Clinic",
        clinicAddress: "123 Medical Plaza, Karachi",
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTime: { start: "09:00", end: "17:00" },
        isApproved: true,
        ratings: [4.5, 4.8, 5.0, 4.7, 4.9],
        reviews: ["Excellent doctor", "Very professional", "Highly recommended"]
      },
      {
        user: createdUsers[1]._id,
        specialization: "Pediatrics",
        degrees: ["MBBS", "FCPS Pediatrics"],
        experience: "8 years",
        licenseNumber: "PMC-12346",
        clinicName: "Children's Health Center",
        clinicAddress: "456 Kids Avenue, Lahore",
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        availableTime: { start: "10:00", end: "18:00" },
        isApproved: true,
        ratings: [4.9, 5.0, 4.8, 4.9],
        reviews: ["Great with kids", "Very caring"]
      },
      {
        user: createdUsers[2]._id,
        specialization: "Dermatology",
        degrees: ["MBBS", "MD Dermatology"],
        experience: "12 years",
        licenseNumber: "PMC-12347",
        clinicName: "Skin Care Specialists",
        clinicAddress: "789 Beauty Street, Islamabad",
        availableDays: ["Monday", "Tuesday", "Thursday"],
        availableTime: { start: "11:00", end: "19:00" },
        isApproved: true,
        ratings: [4.7, 4.8, 4.6, 4.9, 5.0],
        reviews: ["Excellent results", "Very knowledgeable"]
      },
      {
        user: createdUsers[3]._id,
        specialization: "Orthopedics",
        degrees: ["MBBS", "MS Orthopedics"],
        experience: "15 years",
        licenseNumber: "PMC-12348",
        clinicName: "Bone & Joint Clinic",
        clinicAddress: "321 Health Road, Rawalpindi",
        availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
        availableTime: { start: "08:00", end: "16:00" },
        isApproved: true,
        ratings: [4.8, 4.9, 4.7],
        reviews: ["Best orthopedic surgeon"]
      }
    ];

    const createdDoctors = [];
    for (const doctorData of doctorProfiles) {
      const existingDoctor = await Doctor.findOne({ user: doctorData.user });
      if (!existingDoctor) {
        const doctor = await Doctor.create(doctorData);
        createdDoctors.push(doctor);
        console.log(`✅ Created doctor profile for user ID: ${doctorData.user}`);
      } else {
        createdDoctors.push(existingDoctor);
        console.log(`ℹ️ Doctor profile already exists for user ID: ${doctorData.user}`);
      }
    }

    res.json({
      success: true,
      message: "Sample doctors created successfully",
      count: createdDoctors.length,
      doctors: createdDoctors
    });
  } catch (error) {
    console.error('❌ Error creating sample doctors:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

exports.fixDoctorProfiles = async (req, res) => {
    try {
        console.log('🔧 Fixing doctor profiles...');
        
        const doctorUsers = await User.find({ role: 'Doctor' });
        
        let fixed = 0;
        let alreadyExists = 0;
        
        for (const user of doctorUsers) {
            const existingProfile = await Doctor.findOne({ user: user._id });
            
            if (!existingProfile) {
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
                console.log(`✅ Created profile for ${user.name} (${user.email})`);
                fixed++;
            } else {
                alreadyExists++;
            }
        }
        
        console.log(`✅ Fixed ${fixed} doctor profiles`);
        
        res.json({
            success: true,
            message: 'Doctor profiles fixed successfully',
            totalDoctors: doctorUsers.length,
            profilesCreated: fixed,
            alreadyExisted: alreadyExists
        });
        
    } catch (error) {
        console.error('❌ Error fixing doctor profiles:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
