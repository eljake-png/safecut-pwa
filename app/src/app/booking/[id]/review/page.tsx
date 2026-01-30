'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Отримуємо дані про замовлення
      const bookingRef = doc(db, 'bookings', id);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        alert('Замовлення не знайдено');
        router.push('/');
        return;
      }

      const bookingData = bookingSnap.data();
      const barberId = bookingData.barberId;

      if (!barberId) {
        console.error("No barberId in booking");
        router.push('/');
        return;
      }

      // 2. Оновлюємо рейтинг у колекції BARBERS (Виправлено з 'users')
      const barberRef = doc(db, 'barbers', barberId);

      await runTransaction(db, async (transaction) => {
        const barberDoc = await transaction.get(barberRef);
        
        let newRating = rating;
        let newCount = 1;

        if (barberDoc.exists()) {
          const barberData = barberDoc.data();
          // Читаємо поточні, якщо їх немає - вважаємо 0 (але якщо там 5 і 0, то візьме 5 і 0)
          const currentRating = Number(barberData.rating) || 0;
          const currentCount = Number(barberData.reviewsCount) || 0;

          // Якщо reviewsCount було 0, але рейтинг 5 (стартовий фейковий), 
          // то математично правильно почати рахувати з нуля, або врахувати це як одну оцінку.
          // Але давай зробимо чесно:
          if (currentCount === 0) {
             // Це перша реальна оцінка
             newCount = 1;
             newRating = rating;
          } else {
             newCount = currentCount + 1;
             newRating = ((currentRating * currentCount) + rating) / newCount;
          }

          transaction.update(barberRef, {
            rating: newRating,
            reviewsCount: newCount
          });
        } else {
          // Якщо такого барбера в базі 'barbers' немає - створюємо
          transaction.set(barberRef, {
            rating: newRating,
            reviewsCount: newCount,
            name: bookingData.barberName || 'Unknown Barber'
          }, { merge: true });
        }

        // 3. Позначаємо замовлення як оцінене
        transaction.update(bookingRef, {
          rating: rating,
          reviewLeft: true,
          reviewedAt: serverTimestamp()
        });
      });

      alert('Дякуємо за відгук!');
      router.push('/'); 

    } catch (e) {
      console.error("Error submitting review:", e);
      alert('Помилка при відправці відгуку.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      
      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
        <span className="text-4xl">✂️</span>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
        Як вам стрижка?
      </h1>
      <p className="text-zinc-500 mb-12">Барбер завершив роботу.</p>

      {/* ЗІРКИ */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'grayscale-0' : 'grayscale opacity-30'}`}
          >
            ⭐
          </button>
        ))}
      </div>

      {/* КНОПКА ПІДТВЕРДЖЕННЯ */}
      <button 
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full max-w-xs bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-zinc-500/20 flex items-center justify-center"
      >
        {isSubmitting ? (
           <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2"></span>
        ) : null}
        {isSubmitting ? 'ОБРОБКА...' : 'ЗАВЕРШИТИ'}
      </button>

    </div>
  );
}