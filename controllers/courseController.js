const Course = require("../models/course");

// Create a new course (instructor only)
exports.CreateCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("📋 Creating course for User ID:", userId);

    // Check if user is an instructor
    if (userRole !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create courses",
      });
    }

    const {
      title,
      description,
      category,
      targetAudience,
      healthConditions,
      difficulty,
      duration,
      modules,
      thumbnail,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and target audience are required",
      });
    }

    const course = await Course.create({
      title,
      description,
      instructor: userId,
      category,
      targetAudience,
      healthConditions: healthConditions || [],
      difficulty,
      duration,
      modules: modules || [],
      thumbnail,
      isPublished: false,
    });

    console.log("✅ Course created successfully:", course._id);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("❌ CreateCourse Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all courses with filters
exports.GetAllCourses = async (req, res) => {
  try {
    const {
      category,
      targetAudience,
      difficulty,
      isPublished,
      instructorId,
      healthCondition,
    } = req.query;

    console.log("📋 Fetching courses with filters:", req.query);

    const query = {};

    if (category) query.category = category;
    if (targetAudience) query.targetAudience = targetAudience;
    if (difficulty) query.difficulty = difficulty;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";
    if (instructorId) query.instructor = instructorId;
    if (healthCondition) {
      query.healthConditions = { $in: [healthCondition] };
    }

    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${courses.length} courses`);

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("❌ GetAllCourses Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get course by ID
exports.GetCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📋 Fetching course:", id);

    const course = await Course.findById(id).populate(
      "instructor",
      "name email"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    console.log("✅ Course found:", course.title);

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("❌ GetCourseById Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update course (instructor only)
exports.UpdateCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log("📋 Updating course:", id, "by user:", userId);

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this course",
      });
    }

    const {
      title,
      description,
      category,
      targetAudience,
      healthConditions,
      difficulty,
      duration,
      modules,
      thumbnail,
    } = req.body;

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (targetAudience) course.targetAudience = targetAudience;
    if (healthConditions !== undefined) course.healthConditions = healthConditions;
    if (difficulty) course.difficulty = difficulty;
    if (duration !== undefined) course.duration = duration;
    if (modules !== undefined) course.modules = modules;
    if (thumbnail) course.thumbnail = thumbnail;

    await course.save();

    console.log("✅ Course updated successfully");

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("❌ UpdateCourse Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete course (instructor only)
exports.DeleteCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log("📋 Deleting course:", id, "by user:", userId);

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course",
      });
    }

    await Course.findByIdAndDelete(id);

    console.log("✅ Course deleted successfully");

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("❌ DeleteCourse Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Publish course
exports.PublishCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log("📋 Publishing course:", id);

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to publish this course",
      });
    }

    // Validate course has content before publishing
    if (!course.modules || course.modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish course without modules",
      });
    }

    course.isPublished = true;
    course.publishedAt = new Date();
    await course.save();

    console.log("✅ Course published successfully");

    res.status(200).json({
      success: true,
      message: "Course published successfully",
      course,
    });
  } catch (error) {
    console.error("❌ PublishCourse Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Unpublish course
exports.UnpublishCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log("📋 Unpublishing course:", id);

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to unpublish this course",
      });
    }

    course.isPublished = false;
    await course.save();

    console.log("✅ Course unpublished successfully");

    res.status(200).json({
      success: true,
      message: "Course unpublished successfully",
      course,
    });
  } catch (error) {
    console.error("❌ UnpublishCourse Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
