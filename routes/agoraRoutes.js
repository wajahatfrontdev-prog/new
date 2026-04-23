const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { RtcTokenBuilder, RtcRole } = require("agora-token");

router.get("/agora/token", protect, async (req, res) => {
  try {
    const { channelName, uid = 0 } = req.query;

    if (!channelName) {
      return res
        .status(400)
        .json({ success: false, message: "Channel name required" });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return res
        .status(500)
        .json({ success: false, message: "Agora credentials missing" });
    }

    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      Number(uid),
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
      privilegeExpiredTs,
    );

    res.json({
      success: true,
      data: {
        token,
        appId,
        channelName,
        uid: Number(uid),
        expiresIn: expirationTimeInSeconds,
      },
    });
  } catch (error) {
    console.error("Token error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
