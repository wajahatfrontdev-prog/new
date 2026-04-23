const express = require("express");
const {
  getAllUsers,
  getUserStats,
  getAllDoctorsTest,
  createSampleDoctors,
  fixDoctorProfiles,
} = require("../controllers/testController");

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/stats", getUserStats);
router.get("/doctors", getAllDoctorsTest);
router.post("/create-sample-doctors", createSampleDoctors);
router.post("/fix-doctor-profiles", fixDoctorProfiles);

module.exports = router;
