import React from 'react';
import Link from 'next/link';

interface UserListProps {
  users: string[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-4 pb-20">
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white px-2">
        Топ майстри
      </h2>
      
      <div className="space-y-3">
        {users.map((user, index) => (
          <Link key={index} href={`/booking/${index + 1}`} className="block">
            <div className="group relative flex items-center justify-between p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-blue-500/50 transition-all duration-200 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shadow-inner">
                  🧔🏻‍♂️
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{user}</h3>
                  <p className="text-xs font-medium text-blue-500">PRO Barber • 4.9 ★</p>
                </div>
              </div>
              
              <div className="h-10 w-10 rounded-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                <span className="text-zinc-400 group-hover:text-white text-lg">➜</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
