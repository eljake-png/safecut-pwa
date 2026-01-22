import React from 'react';

interface UserListProps {
  users: string[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-black dark:text-white text-center tracking-tight">
        Майстри <span className="text-blue-600">Safecut</span>
      </h2>
      
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={index} className="group relative flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              {/* Імітація аватара */}
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">
                💈
              </div>
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{user}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Top Barber • Північний</p>
              </div>
            </div>
            
            <button className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Обрати
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
