'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [orderNum, setOrderNum] = useState<string>('...');

  // 1. ГЕНЕРАЦІЯ ID
  useEffect(() => {
    setOrderNum(Math.floor(Math.random() * 10000).toString());
    // Очистка статусу при вході
    localStorage.removeItem('order_status_SC-8821');
  }, []);

  // 2. СЛУХАЧ ЗАВЕРШЕННЯ (Магія залишається працювати у фоні)
  useEffect(() => {
    const interval = setInterval(() => {
      const status = localStorage.getItem('order_status_SC-8821');
      if (status === 'completed') {
        router.push(`/booking/${id}/review`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans flex flex-col items-center justify-center p-6 text-center">
      
      {/* Жовтий статус (Очікування) */}
      <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 border border-yellow-500/20 animate-pulse">
        <span className="text-5xl">⏳</span>
      </div>

      <div className="inline-block px-4 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
        Очікується адреса
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight mb-4">
        Замовлення прийнято
      </h1>
      
      <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl max-w-sm mb-10 border border-zinc-200 dark:border-zinc-800">
        <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Напишіть свою адресу в <span className="text-blue-600 font-bold">зашифрованому чаті</span> прямо зараз!
        </p>
        <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 my-4"></div>
        <p className="text-xs text-zinc-400">
          🔒 Після виконання замовлення чат буде видалений автоматично заради вашої безпеки.
        </p>
      </div>

      {/* Кнопка "Написати барберу" */}
      <button 
        onClick={() => alert('Відкриваємо зашифрований чат...')} // Тут пізніше можна поставити реальний лінк на чат
        className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
      >
        <span>💬</span>
        НАПИСАТИ БАРБЕРУ
      </button>

      <p className="mt-6 text-xs text-zinc-400 font-mono">
        ID замовлення: #SC-{orderNum}
      </p>

    </div>
  );
}
