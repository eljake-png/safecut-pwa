'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Loader2 } from 'lucide-react';
import BarberList from '@/components/BarberList'; // Переконайся, що шлях правильний
import { BarberProfile } from '@/types';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const BarbersPage: React.FC = () => {
  const router = useRouter();
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Підписка на дані в реальному часі
  useEffect(() => {
    // Створюємо запит до колекції 'barbers', сортуємо за датою створення
    const q = query(collection(db, 'barbers'), orderBy('joinDate', 'desc'));

    // onSnapshot - це "живий" слухач. Якщо хтось змінить дані в базі, список оновиться сам.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const barbersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BarberProfile[];
      
      setBarbers(barbersData);
      setLoading(false);
    });

    // Відписуємось, коли компонент зникає (щоб не їсти пам'ять)
    return () => unsubscribe();
  }, []);

  // 2. Логіка пошуку
  const filteredBarbers = barbers.filter(b => 
    b.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* HEADER */}
      <header className="p-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-4">HR Management</h1>
        <div className="flex items-center bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-700 focus-within:border-blue-500 transition-colors">
          <Search className="mr-2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Пошук за іменем або ніком..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-full text-sm placeholder-zinc-500" 
          />
        </div>
      </header>

      {/* LIST */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center pt-20 text-zinc-500">
             <Loader2 className="animate-spin mr-2" /> Завантаження бази...
          </div>
        ) : filteredBarbers.length === 0 ? (
          <div className="text-center pt-20 text-zinc-500">
            Барберів не знайдено. Натисніть "+", щоб додати.
          </div>
        ) : (
          // Переконайся, що твій компонент BarberList приймає проп 'barbers'
          <BarberList barbers={filteredBarbers} />
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button 
        // Важливо: перевіримо шлях. Я створив сторінку створення нижче.
        onClick={() => router.push('/admin/hr/create')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-900/40 transition-transform active:scale-90 z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default BarbersPage;