"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BarberChatPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <header className="px-4 py-3 flex items-center gap-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20">
        <button 
          onClick={() => router.push('/barber/schedule')}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="flex items-center gap-3 flex-1">
           <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-sm border border-zinc-700">
             AB
           </div>
           <div>
             <h2 className="font-bold text-sm">Alex Blade</h2>
             <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">
                    Замовлення підтверджено
                </p>
             </div>
           </div>
        </div>
      </header>

      {/* COMPACT ACTION BAR */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 py-2 px-4 sticky top-[65px] z-10 flex justify-center">
        <button 
            // ВИПРАВЛЕНО: Редірект на екран сесії
            onClick={() => router.push(`/barber/session/${params.id}`)}
            className="w-full max-w-sm bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 transition-all active:scale-95"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ПОЧАТИ СТРИЖКУ
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-zinc-500 gap-4">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <p className="text-center max-w-xs text-sm">
            Це захищений чат. Повідомлення шифруються на вашому пристрої.
            <br/><br/>
            <span className="text-zinc-600 text-xs">Очікування адреси від клієнта...</span>
        </p>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 safe-area-bottom">
         <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Напишіть повідомлення..." 
              className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600"
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors active:scale-95">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
         </div>
      </div>
    </div>
  );
}
