const express = require("express");
const {
  CreateCourse,
  GetAllCourses,
  GetCourseById,
  UpdateCourse,
  DeleteCourse,
  PublishCourse,
  UnpublishCourse,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", GetAllCourses);
router.get("/:id", GetCourseById);

// Protected routes (require authentication)
router.post("/", protect, CreateCourse);
router.put("/:id", protect, UpdateCourse);
router.delete("/:id", protect, DeleteCourse);
router.post("/:id/publish", protect, PublishCourse);
router.post("/:id/unpublish", protect, UnpublishCourse);

module.exports = router;
