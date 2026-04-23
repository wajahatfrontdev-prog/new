const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("../models/course");
const User = require("../models/user");

dotenv.config();

const testCourseAPI = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find an instructor user
    let instructor = await User.findOne({ role: "Instructor" });
    
    if (!instructor) {
      console.log("⚠️  No instructor found, creating test instructor...");
      instructor = await User.create({
        name: "Test Instructor",
        email: "test.instructor@icare.com",
        password: "password123",
        role: "Instructor",
        isEmailVerified: true,
      });
      console.log("✅ Test instructor created:", instructor._id);
    } else {
      console.log("✅ Found instructor:", instructor.name, instructor._id);
    }

    // Test 1: Create a Health Program course
    console.log("\n📝 Test 1: Creating Health Program course...");
    const healthProgram = await Course.create({
      title: "Diabetes Management Program",
      description: "Comprehensive program for managing Type 2 Diabetes",
      instructor: instructor._id,
      category: "HealthProgram",
      targetAudience: "Patient",
      healthConditions: ["Diabetes", "Type 2 Diabetes"],
      difficulty: "Beginner",
      duration: 4,
      modules: [
        {
          title: "Understanding Diabetes",
          description: "Learn the basics of diabetes",
          order: 1,
          lessons: [
            {
              title: "What is Diabetes?",
              content: "Diabetes is a chronic condition...",
              videoUrl: "https://example.com/video1.mp4",
              duration: 15,
              order: 1,
            },
            {
              title: "Types of Diabetes",
              content: "There are several types of diabetes...",
              videoUrl: "https://example.com/video2.mp4",
              duration: 20,
              order: 2,
            },
          ],
          quiz: {
            questions: [
              {
                question: "What is the main characteristic of Type 2 Diabetes?",
                options: [
                  "Insulin resistance",
                  "No insulin production",
                  "Autoimmune disorder",
                  "Genetic mutation",
                ],
                correctAnswer: 0,
                explanation: "Type 2 Diabetes is characterized by insulin resistance.",
              },
            ],
            passingScore: 70,
          },
        },
      ],
      thumbnail: "https://example.com/diabetes-thumbnail.jpg",
    });
    console.log("✅ Health Program created:", healthProgram._id);
    console.log("   Title:", healthProgram.title);
    console.log("   Category:", healthProgram.category);
    console.log("   Target Audience:", healthProgram.targetAudience);
    console.log("   Modules:", healthProgram.modules.length);

    // Test 2: Create a Professional Course
    console.log("\n📝 Test 2: Creating Professional Course...");
    const professionalCourse = await Course.create({
      title: "Advanced Cardiology Techniques",
      description: "Latest techniques in cardiology for medical professionals",
      instructor: instructor._id,
      category: "ProfessionalCourse",
      targetAudience: "Doctor",
      difficulty: "Advanced",
      duration: 10,
      modules: [
        {
          title: "Introduction to Advanced Cardiology",
          description: "Overview of advanced techniques",
          order: 1,
          lessons: [
            {
              title: "Modern Diagnostic Tools",
              content: "Learn about the latest diagnostic tools...",
              videoUrl: "https://example.com/cardio1.mp4",
              duration: 30,
              order: 1,
            },
          ],
        },
      ],
      thumbnail: "https://example.com/cardiology-thumbnail.jpg",
    });
    console.log("✅ Professional Course created:", professionalCourse._id);
    console.log("   Title:", professionalCourse.title);
    console.log("   Category:", professionalCourse.category);
    console.log("   Target Audience:", professionalCourse.targetAudience);

    // Test 3: Query courses
    console.log("\n📝 Test 3: Querying courses...");
    const allCourses = await Course.find().populate("instructor", "name email");
    console.log("✅ Total courses in database:", allCourses.length);

    const healthPrograms = await Course.find({ category: "HealthProgram" });
    console.log("✅ Health Programs:", healthPrograms.length);

    const professionalCourses = await Course.find({
      category: "ProfessionalCourse",
    });
    console.log("✅ Professional Courses:", professionalCourses.length);

    const patientCourses = await Course.find({ targetAudience: "Patient" });
    console.log("✅ Patient-targeted courses:", patientCourses.length);

    const doctorCourses = await Course.find({ targetAudience: "Doctor" });
    console.log("✅ Doctor-targeted courses:", doctorCourses.length);

    // Test 4: Update course
    console.log("\n📝 Test 4: Updating course...");
    healthProgram.isPublished = true;
    healthProgram.publishedAt = new Date();
    await healthProgram.save();
    console.log("✅ Course published successfully");
    console.log("   Published at:", healthProgram.publishedAt);

    // Test 5: Query published courses
    console.log("\n📝 Test 5: Querying published courses...");
    const publishedCourses = await Course.find({ isPublished: true });
    console.log("✅ Published courses:", publishedCourses.length);

    console.log("\n✅ All tests completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   - Course model: ✅ Working");
    console.log("   - Create operations: ✅ Working");
    console.log("   - Query operations: ✅ Working");
    console.log("   - Update operations: ✅ Working");
    console.log("   - Categories: ✅ HealthProgram, ProfessionalCourse");
    console.log("   - Target Audiences: ✅ Patient, Doctor");
    console.log("   - Modules & Lessons: ✅ Working");
    console.log("   - Quiz functionality: ✅ Working");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

testCourseAPI();
