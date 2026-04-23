const express = require("express");
const { getPendingUsers, approveUser, rejectUser, getApprovedUsers, getAuditLogs } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// Note: If you have an adminMiddleware, you can add it here instead of just 'protect'
const router = express.Router();

router.get("/pending-users", protect, getPendingUsers);
router.get("/approved-users", protect, getApprovedUsers);
router.get("/audit-logs", protect, getAuditLogs);
router.post("/approve-user/:userId", protect, approveUser);
router.post("/reject-user/:userId", protect, rejectUser);

module.exports = router;
