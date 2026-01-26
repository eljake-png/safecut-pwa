"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Calendar, User, MessageSquare, Loader2 } from 'lucide-react';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

// Типізація даних з бази
interface Booking {
  id: string;
  clientName: string;
  services: string[]; // У базі це масив рядків
  time: string;
  price: number;
  currency: 'UAH' | 'USDT';
  address?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function BarberSchedulePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Слухаємо колекцію замовлень і сортуємо по часу (09:00 -> 18:00)
    const q = query(collection(db, 'appointments'), orderBy('time', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedBookings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clientName: data.clientName,
          services: data.services || [], // Беремо реальні послуги
          time: data.time,
          price: data.price,
          currency: data.currency,
          address: data.address || null,
          status: data.status
        } as Booking;
      });
      
      setBookings(loadedBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* HEADER */}
      <header className="px-6 pt-6 pb-4 bg-black/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-900">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Розклад на сьогодні</h1>
          <span className="text-sm text-zinc-500 bg-zinc-900 px-2 py-1 rounded-lg">
            {bookings.length} клієнтів
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
           <div className="text-center py-10 text-zinc-500">
             <p>Розклад порожній 💤</p>
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
                    ${booking.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-zinc-800 border-zinc-700 text-white'}
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
                      {/* Виводимо реальні послуги через кому */}
                      <span className="truncate max-w-[120px]">
                        {booking.services.join(', ')}
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
          className="p-2 flex flex-col items-center gap-1 text-white w-16 transition-transform active:scale-90"
        >
          <Calendar size={24} className="text-white" />
          <span className="text-[10px] font-medium text-white">Розклад</span>
        </button>

        <button className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16 active:scale-90">
          <User size={24} />
          <span className="text-[10px] font-medium">Профіль</span>
        </button>
      </div>
    </div>
  );
}