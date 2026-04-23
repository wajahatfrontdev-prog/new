const User = require("../models/user");

// Middleware to check if user's email is verified
const requireEmailVerification = async (req, res, next) => {
  try {
    // Skip verification check for certain routes
    const exemptRoutes = [
      '/api/auth/verify-email',
      '/api/auth/resend-verification',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/forget_password',
      '/api/auth/checkOTP',
      '/api/auth/reset_password',
    ];

    if (exemptRoutes.includes(req.path)) {
      return next();
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Get user from database
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email address to access this feature",
        isEmailVerified: false,
        email: user.email,
      });
    }

    // Email is verified, proceed
    next();
  } catch (error) {
    console.error("Error in email verification middleware:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { requireEmailVerification };
