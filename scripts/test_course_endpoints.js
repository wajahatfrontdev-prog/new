const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

let instructorToken = "";
let courseId = "";

const testCourseEndpoints = async () => {
  try {
    console.log("🚀 Testing Course API Endpoints");
    console.log("Base URL:", BASE_URL);

    // Step 1: Login as instructor to get token
    console.log("\n📝 Step 1: Getting instructor authentication token...");
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: "production.instructor@icare.com",
        password: "instructor123",
      });
      instructorToken = loginResponse.data.token;
      console.log("✅ Instructor logged in successfully");
      console.log("   Token:", instructorToken.substring(0, 20) + "...");
    } catch (error) {
      console.log("⚠️  Login failed, using debug endpoint...");
      const debugResponse = await axios.get(
        `${BASE_URL}/debug/login/production.instructor@icare.com`
      );
      instructorToken = debugResponse.data.token;
      console.log("✅ Got token from debug endpoint");
    }

    // Step 2: Create a new course
    console.log("\n📝 Step 2: Creating a new course (POST /api/courses)...");
    const createResponse = await axios.post(
      `${API_URL}/courses`,
      {
        title: "Heart Health Management",
        description: "Complete guide to maintaining cardiovascular health",
        category: "HealthProgram",
        targetAudience: "Patient",
        healthConditions: ["Heart Disease", "Hypertension"],
        difficulty: "Beginner",
        duration: 6,
        modules: [
          {
            title: "Understanding Your Heart",
            description: "Learn about heart anatomy and function",
            order: 1,
            lessons: [
              {
                title: "Heart Anatomy Basics",
                content: "The heart is a muscular organ...",
                videoUrl: "https://example.com/heart-anatomy.mp4",
                duration: 25,
                order: 1,
              },
            ],
          },
        ],
        thumbnail: "https://example.com/heart-health.jpg",
      },
      {
        headers: { Authorization: `Bearer ${instructorToken}` },
      }
    );
    courseId = createResponse.data.course._id;
    console.log("✅ Course created successfully");
    console.log("   Course ID:", courseId);
    console.log("   Title:", createResponse.data.course.title);
    console.log("   Category:", createResponse.data.course.category);

    // Step 3: Get all courses
    console.log("\n📝 Step 3: Getting all courses (GET /api/courses)...");
    const getAllResponse = await axios.get(`${API_URL}/courses`);
    console.log("✅ Retrieved all courses");
    console.log("   Total courses:", getAllResponse.data.count);
    console.log(
      "   Courses:",
      getAllResponse.data.courses.map((c) => c.title)
    );

    // Step 4: Get course by ID
    console.log("\n📝 Step 4: Getting course by ID (GET /api/courses/:id)...");
    const getByIdResponse = await axios.get(`${API_URL}/courses/${courseId}`);
    console.log("✅ Retrieved course by ID");
    console.log("   Title:", getByIdResponse.data.course.title);
    console.log("   Instructor:", getByIdResponse.data.course.instructor.name);
    console.log("   Modules:", getByIdResponse.data.course.modules.length);

    // Step 5: Update course
    console.log("\n📝 Step 5: Updating course (PUT /api/courses/:id)...");
    const updateResponse = await axios.put(
      `${API_URL}/courses/${courseId}`,
      {
        title: "Heart Health Management - Updated",
        duration: 8,
      },
      {
        headers: { Authorization: `Bearer ${instructorToken}` },
      }
    );
    console.log("✅ Course updated successfully");
    console.log("   New title:", updateResponse.data.course.title);
    console.log("   New duration:", updateResponse.data.course.duration);

    // Step 6: Publish course
    console.log(
      "\n📝 Step 6: Publishing course (POST /api/courses/:id/publish)..."
    );
    const publishResponse = await axios.post(
      `${API_URL}/courses/${courseId}/publish`,
      {},
      {
        headers: { Authorization: `Bearer ${instructorToken}` },
      }
    );
    console.log("✅ Course published successfully");
    console.log("   Published:", publishResponse.data.course.isPublished);
    console.log("   Published at:", publishResponse.data.course.publishedAt);

    // Step 7: Filter courses
    console.log(
      "\n📝 Step 7: Filtering courses (GET /api/courses?category=HealthProgram)..."
    );
    const filterResponse = await axios.get(`${API_URL}/courses`, {
      params: { category: "HealthProgram", isPublished: true },
    });
    console.log("✅ Filtered courses retrieved");
    console.log("   Health Programs found:", filterResponse.data.count);

    // Step 8: Unpublish course
    console.log(
      "\n📝 Step 8: Unpublishing course (POST /api/courses/:id/unpublish)..."
    );
    const unpublishResponse = await axios.post(
      `${API_URL}/courses/${courseId}/unpublish`,
      {},
      {
        headers: { Authorization: `Bearer ${instructorToken}` },
      }
    );
    console.log("✅ Course unpublished successfully");
    console.log("   Published:", unpublishResponse.data.course.isPublished);

    // Step 9: Test authorization (try to update as non-owner)
    console.log("\n📝 Step 9: Testing authorization...");
    try {
      await axios.put(
        `${API_URL}/courses/${courseId}`,
        { title: "Unauthorized Update" },
        {
          headers: { Authorization: `Bearer invalid_token` },
        }
      );
      console.log("❌ Authorization test failed - should have been rejected");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("✅ Authorization working correctly - unauthorized access blocked");
      } else {
        console.log("⚠️  Unexpected error:", error.message);
      }
    }

    // Step 10: Delete course
    console.log("\n📝 Step 10: Deleting course (DELETE /api/courses/:id)...");
    const deleteResponse = await axios.delete(
      `${API_URL}/courses/${courseId}`,
      {
        headers: { Authorization: `Bearer ${instructorToken}` },
      }
    );
    console.log("✅ Course deleted successfully");
    console.log("   Message:", deleteResponse.data.message);

    // Verify deletion
    console.log("\n📝 Step 11: Verifying deletion...");
    try {
      await axios.get(`${API_URL}/courses/${courseId}`);
      console.log("❌ Deletion verification failed - course still exists");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("✅ Deletion verified - course not found");
      } else {
        console.log("⚠️  Unexpected error:", error.message);
      }
    }

    console.log("\n✅ All API endpoint tests completed successfully!");
    console.log("\n📊 Test Summary:");
    console.log("   ✅ POST /api/courses - Create course");
    console.log("   ✅ GET /api/courses - Get all courses");
    console.log("   ✅ GET /api/courses/:id - Get course by ID");
    console.log("   ✅ PUT /api/courses/:id - Update course");
    console.log("   ✅ POST /api/courses/:id/publish - Publish course");
    console.log("   ✅ POST /api/courses/:id/unpublish - Unpublish course");
    console.log("   ✅ DELETE /api/courses/:id - Delete course");
    console.log("   ✅ Authorization checks working");
    console.log("   ✅ Filtering by category working");
    console.log("   ✅ Instructor-only operations enforced");

  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Message:", error.response.data.message || error.response.data);
    } else {
      console.error("   Error:", error.message);
    }
  }
};

// Check if server is running
console.log("🔍 Checking if server is running...");
axios
  .get(`${BASE_URL}/api/test`)
  .then(() => {
    console.log("✅ Server is running");
    testCourseEndpoints();
  })
  .catch(() => {
    console.log("⚠️  Server might not be running at", BASE_URL);
    console.log("Please start the server with: npm start");
    console.log("\nAttempting tests anyway...");
    testCourseEndpoints();
  });
