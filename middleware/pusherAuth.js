const jwt = require("jsonwebtoken");
const User = require("../models/user");

const pusherAuth = async (req, res, next) => {
  try {
    const { socket_id, channel_name } = req.body;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.socket_id = socket_id;
    req.channel_name = channel_name;

    next();
  } catch (error) {
    console.error("Pusher auth error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = pusherAuth;
