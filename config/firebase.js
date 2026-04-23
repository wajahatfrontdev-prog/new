const admin = require('firebase-admin');
const path = require('path');

let firebaseInitialized = false;

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // From env variable (JSON string)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Check if service account has required fields
      if (serviceAccount.private_key && serviceAccount.client_email) {
        credential = admin.credential.cert(serviceAccount);
        admin.initializeApp({ credential });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized');
      } else {
        console.warn('⚠️  Firebase credentials incomplete - Push notifications disabled');
        console.warn('   For local testing, this is OK. Configure Firebase for production.');
      }
    } else {
      // From file (preferred on VPS)
      const keyPath = path.join(__dirname, 'serviceAccountKey.json');
      try {
        credential = admin.credential.cert(require(keyPath));
        admin.initializeApp({ credential });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized from file');
      } catch (fileErr) {
        console.warn('⚠️  Firebase service account file not found - Push notifications disabled');
        console.warn('   For local testing, this is OK. Configure Firebase for production.');
      }
    }
  } catch (error) {
    console.warn('⚠️  Firebase initialization failed - Push notifications disabled');
    console.warn('   Error:', error.message);
    console.warn('   For local testing, this is OK. Configure Firebase for production.');
  }
}

/**
 * Send a push notification to a single FCM token
 * @param {string} fcmToken - Device FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Extra data payload (all values must be strings)
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!firebaseInitialized) {
    console.log('📲 Push notification skipped (Firebase not configured)');
    return;
  }

  if (!fcmToken) return;

  // Ensure all data values are strings
  const stringData = {};
  for (const [k, v] of Object.entries(data)) {
    stringData[k] = String(v);
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: stringData,
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'icare_high_importance' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`📲 Push sent to ${fcmToken.substring(0, 20)}... response: ${response}`);
  } catch (err) {
    // Token expired/invalid — clear it from DB silently
    if (err.code === 'messaging/registration-token-not-registered' ||
        err.code === 'messaging/invalid-registration-token') {
      console.warn(`⚠️ Invalid FCM token, clearing from DB`);
      const User = require('../models/user');
      await User.findOneAndUpdate({ fcmToken }, { fcmToken: null }).catch(() => {});
    } else {
      console.warn('⚠️ Push notification failed (non-critical):', err.message);
    }
  }
};

module.exports = { sendPushNotification };
