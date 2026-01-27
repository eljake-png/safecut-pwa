Safecut: Loyalty Program Specification
Current Database Structure:

clients: { nickname: string, role: "client", createdAt: timestamp }

bookings: { clientId: string, barberId: string, status: "completed" | "pending", services: [{ price: number }] }

Business Logic:

Відмова від крипто-монет. Система базується на лічильнику.

Кожна 10-та стрижка — безкоштовна (знижка 100%).

Потрібно додати поле haircut_count в документ клієнта.

Після завершення замовлення (status: completed), лічильник інкрементується.

Tech Stack: Next.js (App Router), Tailwind CSS, Firestore.

Technical Specification: Safecut Loyalty System
1. Database Schema (Firestore)
Collection: clients
Для кожного документа клієнта (clients/{clientId}) необхідно додати об'єкт loyalty:

completed_haircuts (number): Загальна кількість успішно завершених та оплачених стрижок.

is_next_free (boolean): Прапорець, який стає true, коли completed_haircuts % 10 == 9.

last_updated (timestamp): Час останнього інкременту для запобігання фроду.

Collection: bookings
Ми відстежуємо зміни саме тут:

status: Тільки при переході зі статусу pending/confirmed у completed спрацьовує тригер лояльності.

is_free_booking (boolean): Мітка, що це саме та 10-та безкоштовна стрижка (щоб не рахувати її в нову десятку, або за правилами бізнесу — на твій розсуд).

final_price (number): Якщо is_free_booking: true, ціна має бути 0.

2. Logic & Atomicity (Gemma's Focus)
Gemma має перевірити наступне:

Idempotency (Ідемпотентність): Система не повинна зараховувати одну й ту саму стрижку двічі, якщо сторінка була оновлена або тригер спрацював повторно.

Рішення: Використовувати transaction у Firestore для перевірки, чи це замовлення вже було враховане.

Race Conditions: Якщо клієнт записується на дві стрижки одночасно, лічильник має оновлюватися послідовно.

Security Rules: Клієнт не може сам редагувати свій completed_haircuts. Доступ на запис (write) має бути тільки у сервісної функції або у барбера зі статусом admin.

3. Firebase Security Rules (Draft for QA)
Агент-тестувальник повинен провалідувати такі правила:

JavaScript
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      // Клієнт може читати свій лічильник, але не змінювати його
      allow read: if request.auth != null && request.auth.uid == clientId;
      allow write: if false; // Тільки через Cloud Functions або Admin SDK
    }
  }
}
4. UI/UX Requirements for Frontend
Progress Visualization: Компонент має відображати "Стрижок до подарунка: X/10".

Zero-Price State: Якщо is_next_free: true, на екрані вибору послуг ціна має відображатися як "0 грн" або "Подарунок".

Confetti Trigger: При досягненні 10-ї стрижки — візуальний ефект успіху.

5. Edge Cases (Кейси для тестування)
Клієнт скасував замовлення після того, як воно було відмічене як completed. (Чи повертається лічильник назад?)

Барбер змінив ціну вручну під час візиту.

Клієнт видалив свій акаунт і створив новий. (Чи переноситься лояльність? — Ні, за замовчуванням).