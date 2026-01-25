import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Твій конфіг з FlutterFlow проекту
const firebaseConfig = {
  apiKey: "AIzaSyAjGp0SSYrqzzX9dJK28crni0b6Yo6l4mA",
  authDomain: "safecut-eff32.firebaseapp.com",
  projectId: "safecut-eff32",
  storageBucket: "safecut-eff32.firebasestorage.app",
  messagingSenderId: "964151958658",
  appId: "1:964151958658:web:33d0b781b319f45e72e89b",
  measurementId: "G-4SPKP96HXK"
};

// Singleton патерн:
// Перевіряємо, чи Firebase вже запущено. Якщо так — беремо існуючий, ні — запускаємо новий.
// Це рятує від помилок при перезавантаженні Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };