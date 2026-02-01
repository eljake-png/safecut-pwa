import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// --- Ініціалізація Admin SDK ---
// Ми перевіряємо !admin.apps.length, щоб не ініціалізувати додаток двічі 
// (це викликає помилку при гарячому перезавантаженні Next.js)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // КРИТИЧНО ВАЖЛИВО: .env перетворює \n на текст, тому ми замінюємо їх назад на символи переносу
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  try {
    // 1. Отримуємо дані з тіла запиту
    const { token, title, body, link } = await request.json();

    // 2. Валідація
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // 3. Формуємо повідомлення
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      // Налаштування специфічні для Web Push (PWA)
      webpush: {
        fcmOptions: {
          link: link || '/barber/dashboard', // Куди перекине при кліку (за замовчуванням - дашборд)
        },
        notification: {
            icon: '/icon-192x192.png', // Переконайся, що у тебе є ця іконка в папці public
            badge: '/badge.png',       // (Необов'язково) іконка для статус-бару Android
            requireInteraction: true   // Сповіщення висітиме, поки користувач не натисне
        }
      },
    };

    // 4. Відправка через Firebase Admin SDK
    const response = await admin.messaging().send(message);
    
    console.log('✅ Push sent successfully:', response);
    return NextResponse.json({ success: true, messageId: response });

  } catch (error: any) {
    console.error('❌ Error sending push:', error);
    
    // Повертаємо деталі помилки, щоб бачити в консолі, що пішло не так
    return NextResponse.json(
        { error: error.message || 'Failed to send push' }, 
        { status: 500 }
    );
  }
}