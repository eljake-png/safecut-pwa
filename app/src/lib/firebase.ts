import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Додаємо імпорт для сповіщень
import { getMessaging } from "firebase/messaging"; 

// Твій конфіг з FlutterFlow проекту
const firebaseConfig = {
  apiKey: "AIzaSyDNDth-epTMA5uitoOTJ8eu7RUAO69n8D4",
  authDomain: "safecut-eff32.firebaseapp.com",
  projectId: "safecut-eff32",
  storageBucket: "safecut-eff32.firebasestorage.app",
  messagingSenderId: "964151958658",
  appId: "1:964151958658:web:33d0b781b319f45e72e89b",
  measurementId: "G-4SPKP96HXK"
};

// Singleton патерн:
// Перевіряємо, чи Firebase вже запущено. Якщо так — беремо існуючий, ні — запускаємо новий.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

// Ініціалізація Messaging (Тільки на стороні клієнта/браузера)
let messaging: any = null;

if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.error("Firebase Messaging failed to initialize (this is normal on server-side):", err);
  }
}

export { db, auth, messaging };