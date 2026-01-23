"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BarberDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-black sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-lg border border-zinc-700">
            EJ
          </div>
          <div>
            <h1 className="font-bold text-sm">Elis Jake</h1>
            <p className="text-xs text-zinc-500">PRO Barber</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-900/30 border border-green-800 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400 font-medium">ACTIVE</span>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
             <p className="text-xs text-zinc-500 mb-1 font-bold">ВИРУЧКА ЗА СЬОГОДНІ</p>
             <div className="flex justify-between items-end">
               <span className="text-2xl font-bold">1200 ₴</span>
               <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1 rounded">💵 CASH</span>
             </div>
             <div className="flex justify-between items-end mt-1">
               <span className="text-lg font-bold text-blue-400">45 USDT</span>
               <span className="text-[10px] text-blue-900 bg-blue-500/10 px-1 rounded">💎 CRYPTO</span>
             </div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
             <p className="text-xs text-zinc-500 mb-1 font-bold">РОБОТА НА СЬОГОДНІ</p>
             <span className="text-4xl font-bold">5</span>
             <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   <span className="text-[10px] text-zinc-400">2 в черзі</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="text-[10px] text-zinc-400">3 виконано</span>
                </div>
             </div>
          </div>
        </div>

        {/* New Request Card */}
        <div className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-50 group-hover:opacity-75 transition duration-200 blur"></div>
          <div className="relative w-full bg-zinc-950 rounded-2xl p-6 border border-zinc-800">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                   <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Новий запит</span>
                </div>
                <span className="text-xs text-zinc-600 font-mono">#SC-8821</span>
             </div>

             <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="text-3xl font-bold">600 ₴</span>
                   <div className="mt-1 inline-flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-400">
                      💎 USDT
                   </div>
                </div>
                <div className="text-right">
                   <h3 className="font-bold text-lg">@alex_blade</h3>
                   <div className="inline-flex items-center gap-1 bg-zinc-800/50 px-2 py-1 rounded-lg mt-1 border border-zinc-800">
                      <span className="text-xs">🔄 12 замовлень</span>
                   </div>
                </div>
             </div>

             <div className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800 flex items-center gap-4">
                <div className="bg-zinc-800 p-2 rounded-lg">
                   📅
                </div>
                <div>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Час стрижки</p>
                   <div className="flex items-baseline gap-2">
                      <span className="font-bold text-white">Сьогодні</span>
                      <span className="text-zinc-600">|</span>
                      <span className="font-bold text-blue-400 text-xl">14:00</span>
                   </div>
                </div>
             </div>

             <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">Чоловіча стрижка</span>
                <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">Стрижка бороди</span>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold transition-colors">
                   Пропустити
                </button>
                <button 
                  onClick={() => router.push('/barber/schedule')}
                  className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/50 transition-all active:scale-95"
                >
                   ПРИЙНЯТИ
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-2 pb-6 flex justify-around items-center z-50">
        <button className="p-2 flex flex-col items-center gap-1 text-white w-16">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px]">Головна</span>
        </button>
        
        {/* КНОПКА РОЗКЛАДУ ТЕПЕР ПРАЦЮЄ */}
        <button 
          onClick={() => router.push('/barber/schedule')}
          className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-16"
        >
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
