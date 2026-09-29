importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD0ZXnGob3mx03lN_03YjDWIUmsyk6xdjc",
  authDomain: "red-news-f6279.firebaseapp.com",
  projectId: "red-news-f6279",
  storageBucket: "red-news-f6279.firebasestorage.app",
  messagingSenderId: "254660746731",
  appId: "1:254660746731:web:d81bc6ff3a2a62149e4dae",
  measurementId: "G-GHECRPHH5Z"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const url = payload.data?.url || '/';

  self.registration.showNotification(notification.title || 'RED NEWS BHARAT', {
    body: notification.body || 'नई खबर पढ़ें',
    icon: '/logo.webp',
    data: { url }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});