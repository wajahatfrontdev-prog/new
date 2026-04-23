const User = require("../models/user");
const ClinicalAudit = require("../models/clinicalAudit");
const { sendWelcomeEmail } = require("../services/emailService");

// Get clinical audit logs (Admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, status, from, to } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const logs = await ClinicalAudit.find(filter)
      .populate("performedBy", "name email role")
      .populate("targetUser", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all pending users
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ isApproved: false })
            .select("-password")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        console.error("Get Pending Users Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Approve a user
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: "User is already approved" });
        }

        user.isApproved = true;
        await user.save();

        console.log(`✅ User Admin Verification Approved: ${user.email} (${user.role})`);

        // Optional: send welcome email now that they are approved
        try {
            await sendWelcomeEmail(user.email, user.name, user.role);
        } catch (emailErr) {
            console.warn("Could not send approval email:", emailErr.message);
        }

        res.status(200).json({ success: true, message: "User approved successfully", user });
    } catch (error) {
        console.error("Approve User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Reject a user (deletes the pending registration)
exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: "Cannot reject an already approved user" });
        }

        await User.findByIdAndDelete(userId);
        console.log(`❌ User Admin Verification Rejected/Deleted: ${user.email} (${user.role})`);

        res.status(200).json({ success: true, message: "User application rejected successfully" });
    } catch (error) {
        console.error("Reject User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all approved users by role
exports.getApprovedUsers = async (req, res) => {
    try {
        const { role } = req.query; // pharmacist, instructor, laboratory, student, etc.
        const query = { isApproved: true };

        if (role) {
            // Capitalize role to match backend format
            query.role = role.charAt(0).toUpperCase() + role.slice(1);
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Get Approved Users Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
