const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddlerware");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const agoraRoutes = require("./routes/agoraRoutes");
const pusher = require("./config/pusher.config");

dotenv.config();

// Validate required environment variables
function validateRequiredEnvVars() {
  const requiredVars = ['JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateRequiredEnvVars();

connectDB();
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/paitents", require("./routes/patientsRoutes"));
app.use("/api/pharmacy/products", require("./routes/pharmacyProductsRoutes"));
app.use("/api/pharmacy/orders", require("./routes/pharmacyOrdersRoutes"));
app.use("/api/pharmacy", require("./routes/pharmacyRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/appointments", require("./routes/appointmentsRoutes"));
app.use("/api/reminders", require("./routes/remindersRoutes"));
app.use("/api/laboratories", require("./routes/laboratoryRoutes"));
app.use("/api/lab-supplies", require("./routes/labSupplyRoutes"));
app.use("/api/test-catalog", require("./routes/testCatalogRoutes"));
app.use("/api/technicians", require("./routes/technicianRoutes"));
app.use("/api/home-collections", require("./routes/homeCollectionRoutes"));
app.use("/api/qa-verification", require("./routes/qaVerificationRoutes"));
app.use("/api/lab-lms", require("./routes/labLmsRoutes"));
app.use(
  "/api/instructors/courses",
  require("./routes/instructorCoursesRoutes"),
);
app.use(
  "/api/instructors/precautions",
  require("./routes/instructorPrecautionsRoutes"),
);
app.use("/api/instructors", require("./routes/instructorRoutes"));
app.use("/api/students/courses", require("./routes/studentCoursesRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/medical-records", require("./routes/medicalRecordRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use(
  "/api/prescription-templates",
  require("./routes/prescriptionTemplateRoutes"),
);
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/community", require("./routes/communityRoutes"));
app.use("/api/gamification", require("./routes/gamificationRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/vitals", require("./routes/vitalRoutes"));
app.use("/api/lifestyle", require("./routes/lifestyleRoutes"));
app.use("/api/icd-codes", require("./routes/icdRoutes"));
app.use("/api/course-questions", require("./routes/courseQuestionRoutes"));
app.use("/api/clinical", require("./routes/clinicalRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/forum", require("./routes/forumRoutes"));
app.use("/api/credentials", require("./routes/credentialRoutes"));
app.use("/api/reminders", require("./routes/remindersRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api", agoraRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);

app.get("/debug/users", async (req, res) => {
  try {
    const User = require("./models/user");
    const users = await User.find({}).select("-password");
    res.json({
      success: true,
      total: users.length,
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/debug/login/:email", async (req, res) => {
  try {
    const User = require("./models/user");
    const jwt = require("jsonwebtoken");

    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    // Manual token generate karo
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: token,
      note: "Use this token for API calls",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

console.log("PUSHER_CLUSTER:", process.env.PUSHER_CLUSTER);
console.log("PUSHER_APP_ID:", process.env.PUSHER_APP_ID);
console.log("PUSHER_KEY:", process.env.PUSHER_KEY);
