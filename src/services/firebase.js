import { initializeApp } from 'firebase/app';
// messaging dynamically imported on client
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD0ZXnGob3mx03lN_03YjDWIUmsyk6xdjc",
  authDomain: "red-news-f6279.firebaseapp.com",
  projectId: "red-news-f6279",
  storageBucket: "red-news-f6279.firebasestorage.app",
  messagingSenderId: "254660746731",
  appId: "1:254660746731:web:d81bc6ff3a2a62149e4dae",
  measurementId: "G-GHECRPHH5Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

// Messaging dynamically initialized later

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (typeof window === 'undefined') return null;
    if (!('Notification' in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const { getMessaging, getToken } = await import('firebase/messaging');
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = async (callback) => {
  if (typeof window === 'undefined') return () => {};
  const { getMessaging, onMessage } = await import('firebase/messaging');
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
};

// No messaging export needed
export default app;