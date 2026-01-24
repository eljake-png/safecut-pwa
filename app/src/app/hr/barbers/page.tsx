"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react'; // Next.js використовує lucide-react, не LucidePlus
import BarberList from './components/BarberList';
import { BarberProfile } from '../types';

// Mock Data
const mockData: BarberProfile[] = [
  {
    id: '1',
    fullName: 'Alex Blade',
    nickname: 'Blade',
    bio: 'Top barber with 5 years experience.',
    district: 'Pivnichnyi',
    photoUrl: null,
    walletAddress: 'TJ4...demo',
    status: 'active',
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    fullName: 'Maxim K.',
    nickname: 'MaxCut',
    bio: 'Expert in beard trimming.',
    district: 'Center',
    photoUrl: null,
    walletAddress: 'TUe...test',
    status: 'active',
    joinDate: '2024-02-01'
  },
   {
    id: '3',
    fullName: 'Jane Doe',
    nickname: 'J-Style',
    bio: 'Creative stylist.',
    district: 'Soborna',
    photoUrl: null,
    walletAddress: 'TQr...fired',
    status: 'fired',
    joinDate: '2023-11-10'
  }
];

const BarbersPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* HEADER */}
      <header className="p-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-4">HR Management</h1>
        <div className="flex items-center bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-700 focus-within:border-blue-500 transition-colors">
          <Search className="mr-2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Пошук барбера..." 
            className="bg-transparent focus:outline-none w-full text-sm placeholder-zinc-500" 
          />
        </div>
      </header>

      {/* LIST */}
      <div className="p-4">
          <BarberList barbers={mockData} />
      </div>

      {/* FAB (Floating Action Button) */}
      <button 
        onClick={() => router.push('/hr/barbers/create')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-900/40 transition-transform active:scale-90"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default BarbersPage;
