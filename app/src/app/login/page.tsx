"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Fingerprint, ArrowRight, UserPlus, Loader2 } from 'lucide-react';

export default function UniversalGate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login'); // Режим входу або реєстрації
  
  const [formData, setFormData] = useState({
    nickname: '',
    password: ''
  });

  // --- ЛОГІКА ВХОДУ (LOGIN) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. ПЕРЕВІРКА: Чи це HR?
      const adminQ = query(collection(db, 'admins'), 
        where('nickname', '==', formData.nickname), 
        where('password', '==', formData.password)
      );
      const adminSnap = await getDocs(adminQ);

      if (!adminSnap.empty) {
        // Це Адмін!
        router.push('/admin/hr');
        return;
      }

      // 2. ПЕРЕВІРКА: Чи це Барбер?
      const barberQ = query(collection(db, 'barbers'), 
        where('nickname', '==', formData.nickname),
        where('password', '==', formData.password)
      );
      const barberSnap = await getDocs(barberQ);

      if (!barberSnap.empty) {
        // Це Барбер!
        const barberData = barberSnap.docs[0].data();
        localStorage.setItem('barberName', barberData.nickname);
        router.push('/barber/dashboard'); // Шлях до існуючого дешборду
        return;
      }

      // 3. ПЕРЕВІРКА: Чи це Клієнт?
      const clientQ = query(collection(db, 'clients'), 
        where('nickname', '==', formData.nickname),
        where('password', '==', formData.password)
      );
      const clientSnap = await getDocs(clientQ);

      if (!clientSnap.empty) {
        // Це Клієнт!
        router.push('/'); // На головну сторінку замовлення
        return;
      }

      alert("Користувача не знайдено або невірний пароль!");

    } catch (error) {
      console.error("Auth Error:", error);
      alert("Помилка системи безпеки");
    } finally {
      setLoading(false);
    }
  };

  // --- ЛОГІКА РЕЄСТРАЦІЇ (ТІЛЬКИ КЛІЄНТИ) ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        // Перевірка чи такий вже існує
        const checkQ = query(collection(db, 'clients'), where('nickname', '==', formData.nickname));
        const checkSnap = await getDocs(checkQ);
        
        if (!checkSnap.empty) {
            alert("Цей нікнейм вже зайнятий!");
            setLoading(false);
            return;
        }

        // Створюємо клієнта
        await addDoc(collection(db, 'clients'), {
            nickname: formData.nickname,
            password: formData.password,
            role: 'client',
            createdAt: serverTimestamp(),
            bonuses: 0 // Стартові бонуси
        });

        alert("Вітаємо в клубі! Тепер увійдіть.");
        setMode('login'); // Перемикаємо назад на вхід

    } catch (error) {
        console.error("Reg Error:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      
      {/* Декоративний фон */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            Safe<span className="text-blue-600">Cut</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs tracking-[0.3em] uppercase">
            <Fingerprint size={12} />
            <span>Secure Gate</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
            
            {/* Перемикач режимів (Tabs) */}
            <div className="flex bg-zinc-900 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Вхід
                </button>
                <button 
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Реєстрація
                </button>
            </div>

            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            
            <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-3 mb-1 block">Нікнейм</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-600 transition-colors text-lg"
                    placeholder="Elis Jake"
                    value={formData.nickname}
                    onChange={e => setFormData({...formData, nickname: e.target.value})}
                />
            </div>

            <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-3 mb-1 block">Пароль</label>
                <input 
                    type="password" 
                    required
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-600 transition-colors text-lg tracking-widest"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                    mode === 'login' 
                    ? 'bg-white text-black hover:bg-zinc-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                }`}
            >
                {loading ? <Loader2 className="animate-spin" /> : (
                mode === 'login' ? (
                    <>Увійти <ArrowRight size={20} /></>
                ) : (
                    <>Створити акаунт <UserPlus size={20} /></>
                )
                )}
            </button>

            </form>
        </div>
        
        {mode === 'register' && (
            <p className="text-center text-zinc-600 text-xs mt-6 px-4">
                * Барберам та персоналу реєструватися не потрібно. Використовуйте дані, надані HR.
            </p>
        )}

      </div>
    </div>
  );
}