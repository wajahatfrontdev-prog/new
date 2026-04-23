const Pusher = require("pusher");
require("dotenv").config();

const appId = process.env.PUSHER_APP_ID || process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY || process.env.PUSHER_APP_KEY;
const secret = process.env.PUSHER_SECRET || process.env.PUSHER_APP_SECRET;
const cluster =
  process.env.PUSHER_CLUSTER || process.env.PUSHER_APP_CLUSTER || "ap2";

console.log("=== PUSHER ENVIRONMENT VARIABLES ===");
console.log(
  "PUSHER_APP_ID:",
  process.env.PUSHER_APP_ID ? "✓ Set" : "✗ Missing",
);
console.log("PUSHER_KEY/PUSHER_APP_KEY:", key ? "✓ Set" : "✗ Missing");
console.log("PUSHER_SECRET/PUSHER_APP_SECRET:", secret ? "✓ Set" : "✗ Missing");
console.log(
  "PUSHER_CLUSTER/PUSHER_APP_CLUSTER:",
  cluster ? "✓ Set" : "✗ Missing",
);

if (!appId || !key || !secret) {
  console.error("❌ ERROR: Pusher credentials incomplete!");
  console.error("Please set Pusher credentials in .env file");
}

const pusher = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
});

(async () => {
  try {
    await pusher.trigger("test-channel", "test-event", { message: "test" });
    console.log("✅ Pusher connection successful!");
  } catch (error) {
    console.error("❌ Pusher connection failed:", error.message);
  }
})();

module.exports = pusher;
