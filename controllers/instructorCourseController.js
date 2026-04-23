const Instructor = require("../models/instructor");
const InstructorCourse = require("../models/instructorCourse");
const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
const User = require("../models/user");
const Notification = require("../models/notification");

exports.assignCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });

    const { targetUserId, courseId } = req.body;
    
    const course = await InstructorCourse.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== instructor._id.toString()) {
      return res.status(403).json({ message: "Not authorized to assign this course" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "Target user not found" });

    // Check if already enrolled
    const existing = await StudentCourseEnrollment.findOne({ user: targetUserId, course: courseId });
    if (existing) return res.status(400).json({ message: "User already enrolled in this course" });

    const totalVideos = Array.isArray(course.videos) ? course.videos.length : 0;

    const enrollment = await StudentCourseEnrollment.create({
      user: targetUserId,
      course: courseId,
      status: "active",
      progress: { completedVideos: 0, totalVideos, percent: 0 },
    });

    // Notify the user
    await Notification.create({
      user: targetUserId,
      title: "New Course Assigned",
      message: `Instructor ${req.user.name} has assigned you a new course: ${course.title}.`,
      type: "course_assigned",
      metadata: { courseId: course._id, enrollmentId: enrollment._id },
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    console.error("Assign Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });
    const { title, caption, videos, visibility } = req.body;
    const course = await InstructorCourse.create({
      instructor: instructor._id,
      title,
      caption,
      videos: Array.isArray(videos) ? videos : [],
      visibility: visibility || "public",
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.listCourses = async (req, res) => {
  try {
    const { instructorId, visibility, q } = req.query;
    const filter = {};
    if (instructorId) filter.instructor = instructorId;
    if (visibility) filter.visibility = visibility;
    if (q) filter.title = { $regex: q, $options: "i" };
    const courses = await InstructorCourse.find(filter).populate(
      "instructor",
      "user",
    );
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error("List Courses Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await InstructorCourse.findById(id).populate(
      "instructor",
      "user",
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("Get Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });
    const course = await InstructorCourse.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructor.toString() !== instructor._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this course" });
    }
    const updated = await InstructorCourse.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json({ success: true, course: updated });
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });
    const course = await InstructorCourse.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructor.toString() !== instructor._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }
    await InstructorCourse.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
