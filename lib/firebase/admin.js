import admin from 'firebase-admin';
import logger from '@/lib/logger';

// ── Singleton Firebase Admin Initialization ─────────────────────────────────
function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (serviceAccountKey) {
    try {
      const parsedKey = typeof serviceAccountKey === 'string'
        ? JSON.parse(serviceAccountKey)
        : serviceAccountKey;

      return admin.initializeApp({
        credential: admin.credential.cert(parsedKey),
        projectId,
      });
    } catch (err) {
      logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', { error: err.message });
    }
  }

  // Fallback / Development initialization without credentials
  if (projectId) {
    try {
      return admin.initializeApp({
        projectId,
      });
    } catch (e) {
      logger.warn('Firebase Admin initialized without credentials:', { error: e.message });
    }
  }

  return null;
}

/**
 * Send a push notification to specific FCM device tokens
 * @param {string[]} tokens - Array of recipient FCM device tokens
 * @param {Object} payload - Notification payload { title, body, data, icon }
 */
export async function sendPushNotification(tokens, { title, body, data = {}, icon = '/favicon.ico' }) {
  if (!tokens || tokens.length === 0) return { success: false, reason: 'No tokens provided' };

  const adminApp = getFirebaseAdmin();
  if (!adminApp) {
    logger.warn('Firebase Admin is not configured. Push notification skipped.');
    return { success: false, reason: 'Firebase Admin unconfigured' };
  }

  try {
    const messaging = admin.messaging(adminApp);
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: data.url || '/',
      },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    logger.info('Push notification sent successfully', {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    logger.error('Error sending push notification:', { error: error.message });
    return { success: false, error: error.message };
  }
}

export default getFirebaseAdmin;
