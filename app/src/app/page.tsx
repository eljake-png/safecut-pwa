'use client';

import React from 'react';
import Link from 'next/link';
import { Gem } from 'lucide-react';
import UserList from '@/components/UserList';
import DistrictSelector from '@/components/DistrictSelector';

export default function Home() {
  const users = ['Іван', 'Максим'];

  return (
    <div className='flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='flex min-h-screen w-full max-w-md flex-col items-center py-12 px-6 bg-white dark:bg-black border-x border-zinc-100 dark:border-zinc-900 relative'>
        
        {/* Хедер */}
        <div className="w-full mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white uppercase">
            Safe<span className="text-blue-600">Cut</span>
          </h1>
          <p className="text-xs text-zinc-400 tracking-[0.2em] uppercase mt-2">Virtual Barbershop</p>
        </div>

        {/* Основний функціонал - Стрижки */}
        <div className="w-full flex-grow space-y-8">
          <DistrictSelector />
          <UserList users={users} />
        </div>

        {/* Футер з кнопкою лояльності */}
        <div className="w-full mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-center">
          <Link 
            href="/loyalty" 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          >
            <div className="bg-white dark:bg-zinc-800 p-1.5 rounded-full shadow-sm group-hover:text-blue-600 transition-colors">
              <Gem size={14} />
            </div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 uppercase tracking-wide">
              Програма лояльності
            </span>
          </Link>
        </div>
        
      </main>
    </div>
  );
}