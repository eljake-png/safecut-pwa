'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BarberDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Статистика (початковий стан)
  const [stats, setStats] = useState({
    cash: 1200,
    crypto: 45,
    done: 3,
    queue: 2
  });

  // Замовлення (null якщо немає)
  const [incomingOrder, setIncomingOrder] = useState<{
    id: string;
    clientNickname: string;
    clientOrderCount: number;
    date: string;
    time: string;
    services: string[];
    price: number;
    payment: 'cash' | 'crypto';
  } | null>({
    id: 'SC-8821',
    clientNickname: '@alex_blade',
    clientOrderCount: 12,
    date: 'Сьогодні',
    time: '14:00',
    services: ['Чоловіча стрижка', 'Стрижка бороди'],
    price: 600,
    payment: 'crypto'
  });

  // Ефект для обробки повернення після завершення
  useEffect(() => {
    const status = searchParams.get('status');
    
    if (status === 'success' && incomingOrder) {
      // 1. Оновлюємо статистику
      setStats(prev => ({
        ...prev,
        crypto: prev.crypto + 14, // +14 USDT (приблизно 600 грн)
        done: prev.done + 1,      // +1 виконано
        queue: prev.queue - 1     // -1 в черзі
      }));

      // 2. Прибираємо виконане замовлення
      setIncomingOrder(null);

      // 3. Показуємо повідомлення
      // (У реальному додатку тут був би красивий Toast Notification)
      // alert('💰 Оплата зарахована! +14 USDT');
      
      // 4. Чистимо URL, щоб при оновленні сторінки не додавало гроші знову
      router.replace('/barber/dashboard');
    }
  }, [searchParams]);

  const handleAccept = () => {
    router.push('/barber/chat/SC-8821');
  };

  const handleDecline = () => {
    if (confirm('Ви дійсно хочете відхилити замовлення?')) {
      setIncomingOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
            🧔🏻‍♂️
          </div>
          <div>
            <h1 className="font-bold text-sm">Elis Jake</h1>
            <p className="text-xs text-zinc-400">PRO Barber</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
          ACTIVE
        </div>
      </div>

      <main className="p-6">
        
        {/* STATS SUMMARY (Динамічний) */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between gap-3">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Виручка за сьогодні</p>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline border-b border-zinc-800 pb-1">
                <span className="text-lg font-bold text-white">{stats.cash} ₴</span>
                <span className="text-[10px] text-zinc-500">💵 CASH</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                {/* Анімуємо зміну кольору при оновленні можна додати пізніше */}
                <span className="text-lg font-bold text-blue-400 transition-all duration-500">{stats.crypto} USDT</span>
                <span className="text-[10px] text-zinc-500">💎 CRYPTO</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Робота на сьогодні</p>
            <div>
              <span className="text-4xl font-black text-white">5</span>
              <div className="flex items-center gap-2 mt-2">
                 <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                 <p className="text-[10px] text-zinc-400">{stats.queue} в черзі</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                 <p className="text-[10px] text-zinc-400">{stats.done} виконано</p>
              </div>
            </div>
          </div>

        </div>

        {/* Incoming Order Card OR Empty State */}
        {incomingOrder ? (
          <div className="relative animate-in slide-in-from-bottom duration-500 fade-in">
             {/* Glowing Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-30 animate-pulse"></div>
            
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">● Новий запит</span>
                <span className="text-xs text-zinc-400">#{incomingOrder.id}</span>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-white">{incomingOrder.price} ₴</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-300 border border-zinc-700">
                        {incomingOrder.payment === 'crypto' ? '💎 USDT' : '💵 Готівка'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-bold text-lg text-white font-mono mb-1">{incomingOrder.clientNickname}</p>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold border border-blue-500/20">
                      <span>🔄</span>
                      <span>{incomingOrder.clientOrderCount} замовлень</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex items-center gap-4">
                  <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center text-2xl border border-blue-500/30">
                    📅
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-0.5">Час стрижки</p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{incomingOrder.date}</span>
                        <span className="text-zinc-600 text-lg">|</span>
                        <span className="text-2xl font-black text-blue-400">{incomingOrder.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {incomingOrder.services.map((s, i) => (
                    <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button onClick={handleDecline} className="py-4 rounded-xl font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors">Пропустити</button>
                  <button onClick={handleAccept} className="py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all active:scale-95">ПРИЙНЯТИ</button>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                   <div className="h-full bg-blue-500 w-full animate-[shrink_60s_linear_forwards]"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 opacity-50 animate-in zoom-in duration-500">
            <span className="text-6xl block mb-4 grayscale">💤</span>
            <p className="text-xl font-bold">Всі замовлення виконано</p>
            <p className="text-sm text-zinc-500 mt-2">Очікуємо нових клієнтів...</p>
          </div>
        )}
      </main>
      <div className="fixed bottom-0 w-full bg-zinc-900 border-t border-zinc-800 p-4 flex justify-around text-zinc-500 text-xs">
         <div className="flex flex-col items-center text-white"><span className="text-lg">■</span>Головна</div>
         <div className="flex flex-col items-center"><span className="text-lg">☰</span>Розклад</div>
         <div className="flex flex-col items-center"><span className="text-lg">⚙</span>Профіль</div>
      </div>
    </div>
  );
}
