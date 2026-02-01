'use client';

import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const VAPID_KEY = 'BA9y9XXsohG6OOGBpwsMP4hLBpisBpUT_Y4pV1wQ2rDKKX6kA3FdEPz-QPzuKdiabTmSbh0RjqQhJu2XcOr5VUY';

const useFcmToken = (userId: string | null, collectionName: 'barbers' | 'clients') => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Функція для отримання і збереження токена
  const retrieveToken = async () => {
    if (!messaging || !userId) return;

    try {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        setToken(currentToken);
        // Зберігаємо в базу
        await updateDoc(doc(db, collectionName, userId), {
          fcmToken: currentToken,
          updatedAt: new Date()
        });
        console.log('FCM Token synced to Firestore:', currentToken);
      } else {
        console.log('No registration token available.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      
      // АВТО-ЗБЕРЕЖЕННЯ:
      if (Notification.permission === 'granted' && userId) {
        retrieveToken();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); 

  const requestPermission = async () => {
    if (!messaging) return;

    try {
      const status = await Notification.requestPermission();
      setPermission(status);

      if (status === 'granted') {
        await retrieveToken();
      } else {
        alert("Ви заблокували сповіщення. Щоб увімкнути їх, натисніть на значок замка/налаштувань в адресному рядку браузера.");
      }
    } catch (error) {
      console.error('Permission request failed', error);
    }
  };

  // Слухаємо вхідні повідомлення (Foreground)
  useEffect(() => {
    if (!messaging) return;
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground Message received:', payload);

      // --- 1. ВІДТВОРЮЄМО ЗВУК "DING" ---
      try {
        // Створюємо контекст (працює в усіх сучасних браузерах)
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // Налаштування звуку (приємний синус)
            oscillator.type = 'sine'; 
            oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // Початок 500Hz
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1); // Стрибок вгору
            
            // Налаштування гучності (плавне затухання)
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        }
      } catch (e) {
        console.error("Audio play failed", e);
      }
      // ----------------------------------

      // 2. Показуємо системне сповіщення
      if (Notification.permission === 'granted') {
         new Notification(payload.notification?.title || 'SafeCut', {
            body: payload.notification?.body,
            icon: '/icon-192x192.png'
         });
      }
    });

    return () => unsubscribe();
  }, []);

  return { token, permission, requestPermission };
};

export default useFcmToken;