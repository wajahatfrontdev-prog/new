const express = require("express");
const {
  registerUser,
  loginUser,
  forgetPassword,
  conformationPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forget_password", forgetPassword);
router.post("/checkOTP", conformationPassword);
router.post("/reset_password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
