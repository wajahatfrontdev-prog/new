const bcrypt = require("bcryptjs");
const Patient = require("../models/patient");

exports.AddPaitentsDetails = async (req, res) => {
    try {
        const userId = req.user.id
        const {
            gender,
            dateOfBirth,
            profileImage,
            bloodGroup,
            cnic,
            address,
            allergies,
            medicalConditions,
            currentMedications,
            emergencyContact,
            height,
            weight,
            appointments
        } = req.body;
        const existingProfile = await Patient.findOne({ user: userId }).populate('user', 'name email role phoneNumber createdAt');
        if (existingProfile) {
            existingProfile.gender = gender;
            existingProfile.dateOfBirth = dateOfBirth;
            existingProfile.profileImage = profileImage;
            existingProfile.bloodGroup = bloodGroup;
            existingProfile.cnic = cnic;
            existingProfile.address = address;
            existingProfile.allergies = allergies;
            existingProfile.medicalConditions = medicalConditions;
            existingProfile.currentMedications = currentMedications;
            existingProfile.emergencyContact = emergencyContact;
            existingProfile.height = height;
            existingProfile.weight = weight;
            existingProfile.appointments = appointments;
            await existingProfile.save()
            return res.status(200).json({
                messsage: "Paitent Profile updated successfully",
                existingProfile,
                success: true
            })
        }
        const paitent = await Patient.create({
            user: userId,
            gender,
            dateOfBirth,
            profileImage: profileImage ?? null,
            bloodGroup,
            cnic,
            address,
            allergies,
            medicalConditions: medicalConditions ?? [],
            currentMedications: currentMedications ?? [],
            emergencyContact,
            height,
            weight,
            appointments: appointments ?? [],
        })
        const fullPatient = await Patient.findById(paitent._id).populate('user', 'name email role phoneNumber createdAt');
        return res.status(201).json({
            message: "Paitent profile created successfully",
            paitent: fullPatient,
            success: true
        });
    } catch (error) {
        console.error("AddDoctorDetails Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


exports.getAllPaitent = async (req, res) => {
    try {
        const paitents = await Patient.find().populate("user", "email phoneNumber role name ")
        res.status(200).json({ success: true, paitents, message: 'Get All Patients successfully' })
    } catch (error) {
        console.error("Get All Patients Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id).populate('user', 'name email role phoneNumber createdAt');
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ success: true, patient });
    } catch (error) {
        console.error("Get Patient By Id Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getMyPatientProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const patient = await Patient.findOne({ user: userId }).populate('user', 'name email role phoneNumber createdAt');
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.status(200).json({ success: true, patient });
    } catch (error) {
        console.error("Get My Patient Profile Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
