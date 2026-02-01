// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  // ТУТ ТРЕБА ВСТАВИТИ ТВОЇ ДАНІ З src/lib/firebase.ts
  apiKey: "AIzaSyAjGp0SSYrqzzX9dJK28crni0b6Yo6l4mA",
  authDomain: "safecut-eff32.firebaseapp.com",
  projectId: "safecut-eff32",
  storageBucket: "safecut-eff32.firebasestorage.app",
  messagingSenderId: "964151958658",
  appId: "1:964151958658:web:33d0b781b319f45e72e89b"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Обробка сповіщень у фоні
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', // Твоя іконка PWA
    badge: '/badge.png' // Маленька іконка для Android статус бару
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});