'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateBarberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    fullName: '',
    nickname: '',
    district: 'Pivnichnyi',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Магія Firebase: додаємо документ
      await addDoc(collection(db, 'barbers'), {
        ...form,
        status: 'active',
        rating: 5.0, // Старт з 5 зірок
        reviews: 0,
        photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${form.nickname}`, // Авто-аватар
        walletAddress: '', // Поки пустий, барбер сам прив'яже
        joinDate: serverTimestamp() // Серверний час
      });

      // Повертаємось назад до списку
      router.push('/admin/hr'); // Або шлях, де лежить твій список
    } catch (error) {
      console.error("Помилка:", error);
      alert("Не вдалося створити барбера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        
        {/* Хедер сторінки */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">New Talent Onboarding</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Inputs */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-2">Real Name</label>
            <input 
              required
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl focus:border-blue-600 outline-none"
              placeholder="Ivan Ivanov"
              value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-2">Nickname (Brand)</label>
            <input 
              required
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl focus:border-blue-600 outline-none"
              placeholder="The Butcher"
              value={form.nickname}
              onChange={e => setForm({...form, nickname: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-2">District</label>
            <select 
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl outline-none"
              value={form.district}
              onChange={e => setForm({...form, district: e.target.value})}
            >
              <option value="Pivnichnyi">Pivnichnyi</option>
              <option value="Center">Center</option>
              <option value="Yuvileinyi">Yuvileinyi</option>
              <option value="Boyarka">Boyarka</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-2">Bio / Intro</label>
            <textarea 
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl outline-none h-32"
              placeholder="Top skills, experience..."
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creating...' : (
              <>
                <Save size={20} />
                Create Profile
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}