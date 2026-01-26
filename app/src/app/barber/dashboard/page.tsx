"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Calendar, User, Check, X, Banknote, Diamond, Coffee, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

// Тип даних для замовлення
interface Appointment {
  id: string;
  clientName: string;
  price: number;
  currency: 'UAH' | 'USDT';
  time: string;
  services: string[];
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function BarberDashboard() {
  const router = useRouter();
  const [barberName, setBarberName] = useState('');
  
  // Всі замовлення (і активні, і виконані)
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Статистика (рахується автоматично)
  const [stats, setStats] = useState({
    cash: 0,
    crypto: 0,
    pending: 0,
    completed: 0,
    total: 0
  });

  // 1. Авторизація
  useEffect(() => {
    const storedName = localStorage.getItem('barberName');
    if (!storedName) {
      router.push('/login');
    } else {
      setBarberName(storedName);
    }
  }, [router]);

  // 2. Слухаємо ВСІ замовлення для підрахунку статистики
  useEffect(() => {
    // У реальному продукті тут буде `where('barberId', '==', currentId)` та `where('date', '==', 'today')`
    const q = query(collection(db, 'appointments'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      setAppointments(loadedData);
      
      // --- ЛОГІКА ПІДРАХУНКУ КАСИ ---
      let newStats = { cash: 0, crypto: 0, pending: 0, completed: 0, total: 0 };

      loadedData.forEach(app => {
        // Рахуємо кількість
        if (app.status === 'pending') newStats.pending++;
        if (app.status === 'confirmed') newStats.completed++;
        
        // Рахуємо гроші (тільки з підтверджених/виконаних)
        if (app.status === 'confirmed') {
           if (app.currency === 'USDT') {
             newStats.crypto += Number(app.price);
           } else {
             newStats.cash += Number(app.price);
           }
        }
      });
      
      newStats.total = newStats.pending + newStats.completed;
      setStats(newStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Фільтруємо, щоб показати у списку тільки "Вхідні" (Pending)
  const incomingRequests = appointments.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-lg border border-zinc-700 text-zinc-300">
            {barberName.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-sm">{barberName}</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">PRO Barber</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-900/20 border border-green-900/50 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[10px] text-green-400 font-bold tracking-wide">ACTIVE</span>
        </div>
      </header>

      <div className="px-4 space-y-4 pt-4">
        
        {/* --- STATS CARDS (ПОВЕРНУЛИ РОЗДІЛЕННЯ) --- */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Revenue Card: Cash vs Crypto */}
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
             <p className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-wider">Виручка (Confirmed)</p>
             
             {/* Cash Row */}
             <div className="flex justify-between items-end border-b border-zinc-800 pb-2 mb-2">
               <span className="text-xl font-bold tracking-tight text-white">{stats.cash} ₴</span>
               <div className="flex items-center gap-1 text-[9px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                 <Banknote size={10} /> CASH
               </div>
             </div>

             {/* Crypto Row */}
             <div className="flex justify-between items-end">
               <span className="text-lg font-bold text-blue-400">{stats.crypto} T</span>
               <div className="flex items-center gap-1 text-[9px] text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                 <Diamond size={10} /> USDT
               </div>
             </div>
          </div>

          {/* Workload Card: Pending vs Done */}
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Calendar size={64} />
             </div>
             
             <div>
               <p className="text-[10px] text-zinc-500 mb-1 font-bold uppercase tracking-wider">Всього завдань</p>
               <span className="text-4xl font-black tracking-tighter text-white">{stats.total}</span>
             </div>

             <div className="mt-3 space-y-2">
                {/* Yellow (Pending) */}
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)] animate-pulse"></div>
                   <span className="text-xs text-zinc-300 font-medium">{stats.pending} в черзі</span>
                </div>
                {/* Green (Done) */}
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
                   <span className="text-xs text-zinc-300 font-medium">{stats.completed} виконано</span>
                </div>
             </div>
          </div>
        </div>

        {/* --- DYNAMIC INCOMING REQUESTS --- */}
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-6 ml-1 flex items-center gap-2">
            Вхідні запити 
            {incomingRequests.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">{incomingRequests.length}</span>
            )}
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-zinc-600" />
          </div>
        ) : incomingRequests.length === 0 ? (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl mt-2 bg-zinc-900/20">
            <Coffee size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium text-zinc-500">Запитів немає</p>
            <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wide">Система в очікуванні</p>
          </div>
        ) : (
          // PENDING ORDERS LIST
          incomingRequests.map((req) => (
            <div key={req.id} className="w-full relative group mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-40 group-hover:opacity-70 transition duration-500 blur-md"></div>
              <div className="relative w-full bg-black rounded-2xl p-6 border border-zinc-800 shadow-2xl">
                
                <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                      </span>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Новий запит</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono bg-zinc-900 px-2 py-1 rounded">#{req.id.slice(0, 6)}</span>
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-3xl font-black tracking-tight">{req.price} {req.currency === 'USDT' ? '' : '₴'}</span>
                      {req.currency === 'USDT' && (
                        <div className="mt-1 inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-400 font-medium">
                          <Diamond size={10} className="text-blue-500"/> USDT
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg">{req.clientName}</h3>
                      <div className="inline-flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg mt-1 border border-zinc-800">
                         <span className="text-[10px] text-zinc-400">Клієнт</span>
                      </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-4 mb-5 border border-zinc-800 flex items-center gap-4">
                    <div className="bg-zinc-800 p-2.5 rounded-xl text-white">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide mb-0.5">Час</p>
                      <div className="flex items-baseline gap-2">
                          <span className="font-black text-blue-400 text-lg">{req.time}</span>
                      </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {req.services?.map((service, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                        {service}
                      </span>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      <X size={16} /> Skip
                    </button>
                    <button 
                      onClick={() => router.push('/barber/schedule')}
                      className="py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Accept
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-800 p-2 pb-6 flex justify-around items-center z-50">
     {/* Кнопка "Головна" має вести на Дешборд (або просто оновлювати його) */}
     <button 
          onClick={() => router.push('/barber/dashboard')} 
          className="p-2 flex flex-col items-center gap-1 text-white w-16 transition-transform active:scale-90"
        >
          {/* Я зробив іконку білою (text-white), бо ми зараз саме на цій вкладці */}
          <Home size={24} className="text-white" />
          <span className="text-[10px] font-medium text-white">Головна</span>
        </button>
        
        <button 
          onClick={() => router.push('/barber/schedule')}
          className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16 active:scale-90"
        >
          <Calendar size={24} />
          <span className="text-[10px] font-medium">Розклад</span>
        </button>

        <button className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16 active:scale-90">
          <User size={24} />
          <span className="text-[10px] font-medium">Профіль</span>
        </button>
      </div>
    </div>
  );
}