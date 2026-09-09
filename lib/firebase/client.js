import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// ── Firebase Client Configuration ──────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyArB5herOIIuxfwJz8gQ6jyjebPbqjSh-o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mailgenius-ai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mailgenius-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mailgenius-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "806590376993",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:806590376993:web:8bbdc23cfce29074ec4760",
};

const DEFAULT_VAPID_KEY = "BO7AOkgJ6YkF5NEFwtXSBesOxjbNB2N9bz0iF_XJSbRkjYJ6RL4UxngzmYP25rBJyEX8DKG1eLC-0a4aHY-UK-w";

/**
 * Lazy safe initialization of Firebase client app
 */
export function getFirebaseApp() {
  if (typeof window === 'undefined') return null;
  if (!firebaseConfig.apiKey) return null;

  try {
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('Firebase client initialization warning:', err);
    return null;
  }
}

/**
 * Request notification permission and get FCM registration token
 * @returns {Promise<string|null>} FCM registration token or null
 */
export async function requestFCMToken() {
  if (typeof window === 'undefined') return null;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging is not supported in this browser environment.');
      return null;
    }

    const app = getFirebaseApp();
    if (!app) {
      console.warn('Firebase configuration not available in environment.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied by user.');
      return null;
    }

    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || DEFAULT_VAPID_KEY;

    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      // Save token to server
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: currentToken, action: 'register' }),
        });
      } catch (e) {
        console.warn('Failed to sync token with backend:', e);
      }
      return currentToken;
    }

    return null;
  } catch (error) {
    console.error('Error retrieving FCM token:', error);
    throw error;
  }
}

/**
 * Listen for incoming foreground push notifications
 * @param {Function} callback - Triggered with incoming notification payload
 */
export async function onForegroundMessage(callback) {
  if (typeof window === 'undefined') return () => {};

  try {
    const supported = await isSupported();
    if (!supported) return () => {};

    const app = getFirebaseApp();
    if (!app) return () => {};

    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      if (callback) callback(payload);
    });
  } catch (err) {
    console.warn('Error setting up foreground message listener:', err);
    return () => {};
  }
}
