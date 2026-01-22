'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ActiveMissionPage() {
  const router = useRouter();
  
  // Дані замовлення (розсекречені)
  const order = {
    id: 'SC-8821',
    client: '@alex_blade',
    address: 'м. Рівне, вул. Шухевича 12',
    details: 'Підʼїзд 3, код 45к, 5 поверх',
    phone: '+380 68 *** ** 01', // Телефон прихований, зв'язок тільки через чат/voip
    price: 600,
    status: 'IN_PROGRESS'
  };

  const handleOpenMaps = () => {
    // Відкриває реальну навігацію в телефоні
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`, '_blank');
  };

  const handleComplete = () => {
    if (confirm('Підтверджуєте виконання стрижки та отримання оплати?')) {
      alert('Замовлення закрито! +600 грн');
      router.push('/barber/dashboard'); // Повертаємось на базу
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      
      {/* 1. MAP AREA (Interactive Mockup) */}
      <div className="relative h-[45vh] w-full bg-zinc-900 overflow-hidden">
        
        {/* CSS Map Grid Pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>
        
        {/* Roads (CSS lines) */}
        <div className="absolute top-0 left-1/3 w-4 h-full bg-zinc-800/50 transform -skew-x-12"></div>
        <div className="absolute top-1/2 left-0 w-full h-4 bg-zinc-800/50 transform rotate-12"></div>

        {/* User Location Pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
           <div className="relative">
             <div className="w-4 h-4 bg-blue-500 rounded-full z-10 relative shadow-[0_0_20px_#3b82f6]"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse"></div>
           </div>
           <div className="mt-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold border border-zinc-700 backdrop-blur-md">
             {order.client}
           </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-blue-500/30 flex items-center gap-2">
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
           <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">В роботі</span>
        </div>

      </div>

      {/* 2. ACTION SHEET */}
      <div className="flex-1 bg-zinc-950 rounded-t-3xl -mt-6 relative z-10 border-t border-zinc-800 p-6 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6"></div>

        {/* Client Info Header */}
        <div className="flex justify-between items-center mb-6">
           <div>
             <h2 className="text-2xl font-bold">{order.client}</h2>
             <p className="text-zinc-500 text-sm">PRO клієнт • 12 замовлень</p>
           </div>
           <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-2xl">
             😎
           </div>
        </div>

        {/* Address Card */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-6 flex items-start gap-4">
           <div className="mt-1 text-2xl">📍</div>
           <div className="flex-1">
             <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Точна адреса</p>
             <p className="text-lg font-bold text-white leading-tight mb-1">{order.address}</p>
             <p className="text-sm text-yellow-500">{order.details}</p>
           </div>
        </div>

        {/* ACTION BUTTONS GRID */}
        <div className="grid grid-cols-2 gap-3 mb-auto">
           {/* Navigation */}
           <button 
             onClick={handleOpenMaps}
             className="bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all border border-zinc-700"
           >
             <span className="text-2xl">🗺️</span>
             <span className="text-xs uppercase tracking-wide">Навігація</span>
           </button>

           {/* Secret Chat */}
           <button 
             onClick={() => alert('Відкриваємо зашифрований канал...')}
             className="bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all border border-zinc-700 relative overflow-hidden"
           >
             <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
             <span className="text-2xl">💬</span>
             <span className="text-xs uppercase tracking-wide">Секретний чат</span>
           </button>
        </div>

        {/* COMPLETE SLIDER BUTTON */}
        <button 
          onClick={handleComplete}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-2xl shadow-[0_0_30px_rgba(22,163,74,0.3)] transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">✅</span>
          ЗАВЕРШИТИ ЗАМОВЛЕННЯ (+{order.price}₴)
        </button>

      </div>

    </div>
  );
}
