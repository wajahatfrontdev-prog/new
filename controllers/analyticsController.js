const Instructor = require("../models/instructor");
const InstructorCourse = require("../models/instructorCourse");
const StudentCourseEnrollment = require("../models/studentCourseEnrollment");

exports.getInstructorAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor profile not found" });
    }

    const instructorId = instructor._id;
    const courses = await InstructorCourse.find({ instructor: instructorId });
    const courseIds = courses.map((c) => c._id);

    // 1. Total Enrollments
    const enrollments = await StudentCourseEnrollment.find({
      course: { $in: courseIds },
    });

    // 2. Overall Completion Rate
    const completedCount = enrollments.filter((e) => e.status === "completed").length;
    const totalEnrollments = enrollments.length;
    const overallCompletionRate = totalEnrollments > 0 
      ? Math.round((completedCount / totalEnrollments) * 100) 
      : 0;

    // 3. Course-specific engagement
    const courseEngagement = await Promise.all(courses.map(async (course) => {
      const courseEnrollments = enrollments.filter(e => e.course.toString() === course._id.toString());
      const courseCompleted = courseEnrollments.filter(e => e.status === "completed").length;
      const rate = courseEnrollments.length > 0 ? Math.round((courseCompleted / courseEnrollments.length) * 100) : 0;
      
      // Calculate "dropoff" - for now using a simple logic: if progress < 50%
      const dropoffs = courseEnrollments.filter(e => (e.progress?.percent || 0) < 50).length;
      
      return {
        courseId: course._id,
        title: course.title,
        enrollments: courseEnrollments.length,
        completion: rate,
        dropoff: dropoffs > 0 ? `Module ${Math.floor(Math.random() * 3) + 1}` : "None" // Mocking dropoff point
      };
    }));

    // 4. Monthly trends (Mocked for now)
    const trends = [
      { month: 'Jan', enrollments: 12 },
      { month: 'Feb', enrollments: 19 },
      { month: 'Mar', enrollments: 25 },
    ];

    res.status(200).json({
      success: true,
      analytics: {
        overallCompletionRate: `${overallCompletionRate}%`,
        activeLearners: totalEnrollments - completedCount,
        totalCertificates: completedCount,
        avgRating: 4.8,
        courseEngagement,
        trends
      }
    });
  } catch (error) {
    console.error("Get Instructor Analytics Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.exportAnalytics = async (req, res) => {
  try {
    const { type } = req.body; // 'csv' or 'pdf'
    // In a real app, generate the file here. 
    // For now, return a success message and a mock URL.
    res.status(200).json({
      success: true,
      message: `${type.toUpperCase()} report generated successfully`,
      downloadUrl: `https://example.com/reports/analytics-export-${Date.now()}.${type}`
    });
  } catch (error) {
    res.status(500).json({ message: "Error exporting analytics" });
  }
};
