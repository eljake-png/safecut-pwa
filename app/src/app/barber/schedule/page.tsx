"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Додав Settings в імпорт
import { Home, Calendar, MessageSquare, Loader2, Settings } from 'lucide-react';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

// Типізація даних
interface Booking {
  id: string;
  clientName: string;
  services: string[]; 
  time: string;
  date: string;
  price: number;
  currency: 'UAH' | 'USDT';
  address?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function BarberSchedulePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ЗАУВАЖЕННЯ: Щоб цей запит працював, треба створити індекс за посиланням у консолі!
    const q = query(collection(db, 'bookings'), orderBy('date', 'asc'), orderBy('time', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedBookings = snapshot.docs.map(doc => {
        const data = doc.data();
        
        return {
          id: doc.id,
          clientName: data.clientNickname || 'Клієнт', 
          services: data.services ? data.services.map((s: any) => s.name) : [], 
          time: data.time,
          date: data.date,
          price: data.finalPrice !== undefined ? data.finalPrice : data.totalPrice,
          currency: data.paymentMethod === 'crypto' ? 'USDT' : 'UAH',
          address: data.address || null,
          status: data.status
        } as Booking;
      });
      
      const activeBookings = loadedBookings.filter(b => 
        b.status === 'pending' || b.status === 'confirmed'
      );
      
      setBookings(activeBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* HEADER */}
      <header className="px-6 pt-6 pb-4 bg-black/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-900">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Розклад</h1>
          <span className="text-sm text-zinc-500 bg-zinc-900 px-2 py-1 rounded-lg">
            {bookings.length} активних
          </span>
        </div>
      </header>

      {/* LIST */}
      <div className="px-4 mt-4 space-y-3">
        {loading ? (
           <div className="flex justify-center py-10">
             <Loader2 className="animate-spin text-zinc-600" />
           </div>
        ) : bookings.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-zinc-500 opacity-60">
             <Calendar size={48} className="mb-4 text-zinc-700" />
             <p>Активних записів немає</p>
             <p className="text-xs mt-2">Час відпочити ☕</p>
           </div>
        ) : (
          bookings.map((booking) => {
            const isCrypto = booking.currency === 'USDT';
            
            return (
              <div 
                key={booking.id} 
                className={`bg-zinc-900 border rounded-xl p-4 flex items-center justify-between relative overflow-hidden transition-all
                  ${booking.status === 'pending' ? 'border-yellow-900/30 opacity-80' : 'border-zinc-800'}
                `}
              >
                {/* Crypto Glow Effect */}
                {isCrypto && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/20 blur-xl rounded-full -mr-6 -mt-6 pointer-events-none"></div>
                )}

                <div className="flex items-center gap-4 flex-1">
                  {/* Час */}
                  <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border 
                    ${booking.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                      'bg-zinc-800 border-zinc-700 text-white'}
                  `}>
                    <span className="font-bold text-sm">{booking.time}</span>
                  </div>

                  {/* Інфо */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate pr-2 flex items-center gap-2">
                      {booking.clientName}
                      {booking.status === 'pending' && (
                        <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase">Oчікує</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className={isCrypto ? 'text-blue-400 font-medium' : 'text-zinc-300'}>
                        {booking.price} {booking.currency}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">
                        {booking.date === new Date().toLocaleDateString('uk-UA') ? 'Сьогодні' : booking.date} • {booking.services.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Кнопка Чату */}
                <button 
                    onClick={() => router.push(`/barber/chat/${booking.id}`)}
                    className="ml-3 h-10 w-10 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 relative z-10"
                >
                    <MessageSquare size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-800 p-2 pb-6 flex justify-around items-center z-50">
        <button 
          onClick={() => router.push('/barber/dashboard')} 
          className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16 active:scale-90"
        >
          <Home size={24} />
          <span className="text-[10px] font-medium">Головна</span>
        </button>
        
        <button 
          // Це активна сторінка (Розклад), тому кнопка біла і неактивна для кліку
          className="p-2 flex flex-col items-center gap-1 text-white w-16 transition-transform active:scale-90"
        >
          <Calendar size={24} className="text-white" />
          <span className="text-[10px] font-medium text-white">Розклад</span>
        </button>

        {/* КНОПКА НАЛАШТУВАНЬ ГРАФІКУ */}
        <button 
          onClick={() => router.push('/barber/schedule/setup')}
          className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16 active:scale-90"
        >
          <Settings size={24} />
          <span className="text-[10px] font-medium">Налаштування</span>
        </button>
      </div>
    </div>
  );
}