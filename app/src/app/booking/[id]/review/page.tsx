'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    alert('Дякуємо за відгук!');
    router.push('/'); // Повернення на головну після оцінки
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
        disabled={rating === 0}
        className="w-full max-w-xs bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-zinc-500/20"
      >
        ЗАВЕРШИТИ
      </button>

    </div>
  );
}
