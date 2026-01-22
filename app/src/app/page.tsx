'use client'

import React from 'react';
import UserList from './components/UserList';

export default function Home() {
  const users = ['\u0418\u0432\u0430\u043d', '\u041c\u0430\u043a\u0441\u0438\u043c'];

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start'>
        <UserList users={users} />
      </main>
    </div>
  );
}
