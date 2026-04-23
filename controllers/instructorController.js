const Instructor = require("../models/instructor");
const InstructorCourse = require("../models/instructorCourse");
const InstructorPrecaution = require("../models/instructorPrecaution");
const StudentCourseEnrollment = require("../models/studentCourseEnrollment");

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor profile not found" });
    }

    const instructorId = instructor._id;

    // 1. Total Courses & Public Courses
    const courses = await InstructorCourse.find({ instructor: instructorId });
    const totalCourses = courses.length;
    const publicCourses = courses.filter((c) => c.visibility === "public").length;

    // 2. Total Precautions
    const totalPrecautions = await InstructorPrecaution.countDocuments({
      instructor: instructorId,
    });

    // 3. Total Students (Unique enrollments in instructor's courses)
    const courseIds = courses.map((c) => c._id);
    const enrollments = await StudentCourseEnrollment.find({
      course: { $in: courseIds },
    });
    const uniqueStudents = new Set(enrollments.map((e) => e.user.toString())).size;

    // 4. Avg. Rating & Revenue (Placeholder logic - expand when reviews/payments are added)
    // For now, returning realistic mock-calculated values or 0
    const avgRating = 4.8; 
    const revenue = enrollments.length * 1200; // Mock revenue: 1200 per enrollment

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        publicCourses,
        totalStudents: uniqueStudents,
        totalPrecautions,
        avgRating,
        revenue,
      },
    });
  } catch (error) {
    console.error("Get Instructor Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddInstructorDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bio,
      qualification,
      age,
      gender,
      address,
      card,
      specialties,
      languages,
      experience,
      availabilityDays,
      availabilityTime,
      isVerified,
    } = req.body;
    const existingProfile = await Instructor.findOne({ user: userId }).populate(
      "user",
      "name email phoneNumber role createdAt",
    );
    if (existingProfile) {
      existingProfile.bio = bio;
      existingProfile.qualification = qualification;
      existingProfile.age = age;
      existingProfile.gender = gender;
      existingProfile.address = address;
      existingProfile.card = card;
      existingProfile.specialties = specialties;
      existingProfile.languages = languages;
      existingProfile.experience = experience;
      existingProfile.availabilityDays = availabilityDays;
      existingProfile.availabilityTime = availabilityTime;
      existingProfile.isVerified = isVerified ?? existingProfile.isVerified;
      await existingProfile.save();
      return res.status(200).json({
        message: "Instructor Updated Successfully",
        existingProfile,
        success: true,
      });
    }
    const instructor = await Instructor.create({
      user: userId,
      bio,
      qualification,
      age,
      gender,
      address,
      card,
      specialties: specialties ?? [],
      languages: languages ?? [],
      experience,
      availabilityDays: availabilityDays ?? [],
      availabilityTime,
      isVerified: isVerified ?? false,
    });
    const full = await Instructor.findById(instructor._id).populate(
      "user",
      "name email role phoneNumber createdAt",
    );
    return res.status(201).json({
      message: "Instructor created successfully",
      instructor: full,
      success: true,
    });
  } catch (error) {
    console.error("AddInstructorDetails Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().populate(
      "user",
      "name email role phoneNumber",
    );
    res.status(200).json({ success: true, instructors });
  } catch (error) {
    console.error("Get All Instructors Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId }).populate(
      "user",
      "name email phoneNumber role createdAt",
    );
    if (!instructor) {
      return res.status(404).json({ message: "Instructor profile not found" });
    }
    res.status(200).json({ success: true, instructor });
  } catch (error) {
    console.error("Get My Instructor Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getInstructorById = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await Instructor.findById(id).populate(
      "user",
      "name email role phoneNumber createdAt",
    );
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    res.status(200).json({ success: true, instructor });
  } catch (error) {
    console.error("Get Instructor By Id Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAssignedLearners = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor profile not found" });
    }

    // Get all courses by this instructor
    const courses = await InstructorCourse.find({ instructor: instructor._id });
    const courseIds = courses.map((c) => c._id);

    // Get all enrollments for these courses
    const enrollments = await StudentCourseEnrollment.find({
      course: { $in: courseIds },
    })
      .populate('user', 'name email role')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 });

    // Calculate progress for each enrollment
    const learners = enrollments.map((enrollment) => {
      const totalModules = enrollment.course?.modules?.length || 0;
      const completedModules = enrollment.completedModules?.length || 0;
      const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

      return {
        _id: enrollment._id,
        user: enrollment.user,
        course: enrollment.course,
        progress,
        enrolledAt: enrollment.enrolledAt,
        lastAccessed: enrollment.lastAccessed,
      };
    });

    res.status(200).json({
      success: true,
      count: learners.length,
      learners,
    });
  } catch (error) {
    console.error("Get Assigned Learners Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
