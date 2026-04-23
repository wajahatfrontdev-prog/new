require('dotenv').config();
const { sendPushNotification } = require('../config/firebase');
const User = require('../models/user');
require('../config/db')();

setTimeout(async () => {
  const user = await User.findOne({ fcmToken: { $ne: null } });
  if (!user) {
    console.log('❌ No user with FCM token yet — install APK and login first');
    process.exit();
  }
  console.log('📱 Sending test push to:', user.email);
  await sendPushNotification(
    user.fcmToken,
    'Test Notification',
    'Push notifications are working!',
    { type: 'test' }
  );
  console.log('✅ Done');
  process.exit();
}, 2000);
