"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  clientName: string;
  service: string[];
  time: string;
  price: number;
  currency: 'UAH' | 'USDT';
  address: string | null;
  isCrypto: boolean;
}

export default function BarberSchedulePage() {
  const router = useRouter();

  const bookings: Booking[] = [
    {
      id: "SC-8821",
      clientName: "Alex Blade",
      service: ["Чоловіча стрижка", "Борода"],
      time: "14:00",
      price: 15.02,
      currency: 'USDT',
      address: null,
      isCrypto: true
    },
    {
      id: "SC-8825",
      clientName: "Максим К.",
      service: ["Стрижка під насадку"],
      time: "15:30",
      price: 400,
      currency: 'UAH',
      address: "вул. Соборна 12",
      isCrypto: false
    },
    {
      id: "SC-8830",
      clientName: "Дмитро (Rave)",
      service: ["Комплекс", "Ваксинг"],
      time: "17:00",
      price: 25.50,
      currency: 'USDT',
      address: null,
      isCrypto: true
    },
    {
      id: "SC-8835",
      clientName: "Андрій T.",
      service: ["Дитяча стрижка"],
      time: "18:30",
      price: 350,
      currency: 'UAH',
      address: null,
      isCrypto: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* HEADER */}
      <header className="px-6 pt-6 pb-4 bg-black/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-900">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Розклад на сьогодні</h1>
          <span className="text-sm text-zinc-500">{bookings.length} замовлення</span>
        </div>
      </header>

      {/* COMPACT LIST */}
      <div className="px-4 mt-4 space-y-3">
        {bookings.map((booking) => (
          <div 
            key={booking.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between relative overflow-hidden"
          >
            {/* Crypto Glow Effect */}
            {booking.isCrypto && (
              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600/20 blur-xl rounded-full -mr-4 -mt-4 pointer-events-none"></div>
            )}

            <div className="flex items-center gap-4 flex-1">
              {/* Час */}
              <div className="flex flex-col items-center justify-center bg-zinc-800 h-12 w-12 rounded-lg border border-zinc-700">
                <span className="font-bold text-sm text-white">{booking.time}</span>
              </div>

              {/* Інфо */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate pr-2">{booking.clientName}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                   <span className={booking.isCrypto ? 'text-blue-400 font-medium' : 'text-zinc-300'}>
                     {booking.price} {booking.currency}
                   </span>
                   <span>•</span>
                   <span className="truncate">{booking.service.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Кнопка Чату (Компактна) */}
            <button 
                onClick={() => router.push(`/barber/chat/${booking.id}`)}
                className="ml-3 h-10 w-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shadow-lg shadow-blue-900/20"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-2 pb-6 flex justify-around items-center z-50">
        <button onClick={() => router.push('/barber/dashboard')} className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px]">Головна</span>
        </button>
        
        <button className="p-2 flex flex-col items-center gap-1 text-white w-16">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <span className="text-[10px]">Розклад</span>
        </button>

        <button className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px]">Профіль</span>
        </button>
      </div>
    </div>
  );
}
