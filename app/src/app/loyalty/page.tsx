'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLoyaltyData, Loyalty } from '../../lib/loyalty';

const LoyaltyPage = () => {
  const router = useRouter();
  const [loyaltyData, setLoyaltyData] = useState<Loyalty | null>(null);
  
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    // 👇 ЗМІНА: Перевіряємо LocalStorage замість Firebase Auth
    const storedId = localStorage.getItem('safecut_client_id');
    
    if (storedId) {
      console.log("Found client ID:", storedId);
      setClientId(storedId);
      setAuthLoading(false);
      fetchLoyalty(storedId);
    } else {
      console.log("No client ID found in storage");
      setClientId(null);
      setAuthLoading(false);
    }
  }, []);

  const fetchLoyalty = async (uid: string) => {
    try {
      setDataLoading(true);
      const data = await getLoyaltyData(uid);
      setLoyaltyData(data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('safecut_client_id');
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Якщо юзера немає в Storage
  if (!clientId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Доступ обмежено</h2>
        <p className="mb-6 text-gray-400 max-w-xs">
           Система лояльності доступна тільки авторизованим клієнтам.
        </p>
        <div className="flex gap-4">
            <button 
                onClick={() => router.push('/login')} 
                className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all"
            >
                Увійти в акаунт
            </button>
            <button 
                onClick={() => router.push('/')} 
                className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl font-medium transition-all"
            >
                На головну
            </button>
        </div>
      </div>
    );
  }

  const haircutsCount = loyaltyData?.haircutsCount || 0;
  const neededForBonus = 10;
  const cycligCount = haircutsCount % neededForBonus;
  const remaining = cycligCount === 0 && haircutsCount > 0 ? 0 : neededForBonus - cycligCount;
  const isBonusAvailable = haircutsCount > 0 && cycligCount === 0;
  const currentProgress = cycligCount === 0 && haircutsCount > 0 ? neededForBonus : cycligCount;
  const progressPercent = Math.min((currentProgress / neededForBonus) * 100, 100);

  return (
    <div className='min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#050b14] to-black text-white p-6 flex flex-col items-center'>
      
      <div className="w-full max-w-md mb-6 pt-4 flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-400 hover:text-blue-400 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>

        <button 
          onClick={handleLogout}
          className="text-xs text-red-500/50 hover:text-red-500 transition-colors"
        >
          Вихід
        </button>
      </div>
      
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-[0_0_60px_-20px_rgba(59,130,246,0.4)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent"></div>

        <div className="flex items-center justify-center mb-8 space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-500">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.339-.214-2.654-.634-3.985a.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08zM12 13.25a.75.75 0 00.75-.75v-3a.75.75 0 00-1.5 0v3c0 .414.336.75.75.75zm0 3a.75.75 0 010 1.5H12a.75.75 0 010-1.5z" clipRule="evenodd" />
          </svg>
          <h1 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-400 tracking-widest uppercase'>
            Safecut Loyalty
          </h1>
        </div>
        
        {dataLoading ? (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        ) : (
        <>
            <div className='mb-12 text-center'>
            <div className="flex items-baseline justify-center space-x-1 relative z-10">
                <span className='text-8xl font-black text-white tracking-tighter leading-none drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]'>
                {haircutsCount}
                </span>
                <span className='text-4xl font-light text-blue-300/70'>
                /10
                </span>
            </div>
            <p className='text-blue-200/60 text-sm uppercase tracking-wider mt-4 font-medium'>
                Успішних стрижок
            </p>
            </div>

            <div className='mb-8 relative'>
            <div className="flex justify-between mb-3 text-sm font-medium">
                <span className="text-blue-400/80">Старт</span>
                <span className="text-blue-400">Ціль: Free Cut</span>
            </div>
            
            <div className="w-full bg-black/60 rounded-full h-5 p-1 border border-blue-500/20 box-content shadow-inner">
                <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/25 rounded-t-full"></div>
                </div>
            </div>

            <div className="mt-8 text-center h-16 flex items-center justify-center">
                {isBonusAvailable ? (
                <div className="animate-pulse bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.6)] inline-flex items-center">
                    Вітаємо! Стрижка безкоштовна!
                </div>
                ) : (
                <p className='text-xl text-gray-300 font-light'>
                    Ще <span className="text-blue-400 font-bold text-2xl mx-1 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">{remaining}</span> 
                    {remaining === 1 ? 'стрижка' : remaining < 5 ? 'стрижки' : 'стрижок'} до бонусу
                </p>
                )}
            </div>
            </div>
        </>
        )}
        
        <div className="border-t border-blue-500/10 pt-6 text-center text-sm text-blue-300/50">
          <p>User ID: <span className="font-mono text-xs text-gray-600">{clientId ? `${clientId.slice(0,6)}...` : 'N/A'}</span></p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPage;