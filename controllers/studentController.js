const Student = require('../models/student');

exports.AddStudentDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            bio,
            qualification,
            age,
            gender,
            address,
            card,
            dateOfBirth,
            profileImage,
            educationLevel,
            enrolledCourses,
            preferences,
            isVerified
        } = req.body;
        const existingProfile = await Student.findOne({ user: userId }).populate('user', 'name email phoneNumber role createdAt');
        if (existingProfile) {
            existingProfile.bio = bio;
            existingProfile.qualification = qualification;
            existingProfile.age = age;
            existingProfile.gender = gender;
            existingProfile.address = address;
            existingProfile.card = card;
            existingProfile.dateOfBirth = dateOfBirth;
            existingProfile.profileImage = profileImage;
            existingProfile.educationLevel = educationLevel;
            existingProfile.enrolledCourses = enrolledCourses;
            existingProfile.preferences = preferences;
            existingProfile.isVerified = isVerified ?? existingProfile.isVerified;
            await existingProfile.save();
            return res.status(200).json({
                message: 'Student Updated Successfully',
                existingProfile,
                success: true
            });
        }
        const student = await Student.create({
            user: userId,
            bio,
            qualification,
            age,
            gender,
            address,
            card,
            dateOfBirth,
            profileImage: profileImage ?? null,
            educationLevel,
            enrolledCourses: enrolledCourses ?? [],
            preferences: preferences ?? [],
            isVerified: isVerified ?? false
        });
        const full = await Student.findById(student._id).populate('user', 'name email role phoneNumber createdAt');
        return res.status(201).json({
            message: 'Student created successfully',
            student: full,
            success: true
        });
    } catch (error) {
        console.error('AddStudentDetails Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getMyStudentProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const student = await Student.findOne({ user: userId }).populate('user', 'name email phoneNumber role createdAt');
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.status(200).json({ success: true, student });
    } catch (error) {
        console.error('Get My Student Profile Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name email role phoneNumber');
        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error('Get All Students Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).populate('user', 'name email role phoneNumber createdAt');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ success: true, student });
    } catch (error) {
        console.error('Get Student By Id Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
