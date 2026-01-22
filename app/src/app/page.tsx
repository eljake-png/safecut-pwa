'use client'

import React from 'react';
import UserList from './components/UserList';
import DistrictSelector from './components/DistrictSelector';

export default function Home() {
  const users = ['Іван', 'Максим'];

  return (
    <div className='flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='flex min-h-screen w-full max-w-md flex-col items-center py-12 px-6 bg-white dark:bg-black border-x border-zinc-100 dark:border-zinc-900'>
        
        {/* Хедер */}
        <div className="w-full mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tighter text-black dark:text-white uppercase">
            Safe<span className="text-blue-600">Cut</span>
          </h1>
          <p className="text-xs text-zinc-400 tracking-widest uppercase mt-1">Virtual Barbershop</p>
        </div>

        {/* Віджет вибору району */}
        <DistrictSelector />

        {/* Список майстрів */}
        <UserList users={users} />
        
      </main>
    </div>
  );
}
