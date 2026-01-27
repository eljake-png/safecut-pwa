"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Calendar, User, Check, X, Banknote, Diamond, Coffee, Loader2, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';

// Типи даних
interface Appointment {
  id: string;
  clientId: string; 
  totalPrice: number;
  paymentMethod: 'cash' | 'crypto';
  time: string;
  date: string; 
  services: any[];
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
}

// Хелпер для дати
const getDateLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('.').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) return 'Сьогодні';
  if (targetDate.getTime() === tomorrow.getTime()) return 'Завтра';
  return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}`;
};

// --- КОМПОНЕНТ КАРТКИ ---
const BookingCard = ({ 
  req, 
  onAccept, 
  onSkip 
}: { 
  req: Appointment, 
  onAccept: (id: string, e: any) => void, 
  onSkip: (id: string, e: any) => void 
}) => {
  const [nickname, setNickname] = useState<string>('...');

  useEffect(() => {
    const fetchClientNickname = async () => {
      if (req.clientId === 'temp_user_id') {
        setNickname('Гість');
        return;
      }

      try {
        // Шукаємо в колекції 'clients'
        const userSnap = await getDoc(doc(db, 'clients', req.clientId));
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Беремо nickname, якщо немає - fullName, якщо немає - ID
          setNickname(userData.nickname || userData.fullName || req.clientId);
        } else {
          // Якщо не знайшли в базі, показуємо ID
          setNickname(req.clientId); 
        }
      } catch (e) {
        console.error(e);
        setNickname(req.clientId);
      }
    };
    fetchClientNickname();
  }, [req.clientId]);

  return (
    <div className="w-full relative group animate-in fade-in slide-in-from-bottom-2 duration-300 mb-3">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl opacity-0 group-hover:opacity-50 transition duration-500 blur-md"></div>
      
      <div className="relative w-full bg-black rounded-xl p-4 border border-zinc-800 shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Нове замовлення</span>
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">#{req.id.slice(0, 5).toUpperCase()}</span>
        </div>

        {/* Main Info */}
        <div className="flex justify-between items-start mb-5">
            
            {/* PRICE + BADGE (Right Side) */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                  <span className="text-3xl font-black tracking-tighter text-white leading-none">
                      {req.totalPrice}<span className="text-lg text-zinc-600 align-top ml-0.5">{req.paymentMethod === 'crypto' ? '' : '₴'}</span>
                  </span>
                  
                  {req.paymentMethod === 'crypto' ? (
                    <div className="flex items-center gap-1 bg-blue-950/40 border border-blue-900/50 px-2 py-1 rounded-md text-[10px] font-bold text-blue-400">
                      <Diamond size={10} /> USDT
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md text-[10px] font-bold text-green-500">
                      <Banknote size={10} /> CASH
                    </div>
                  )}
              </div>
            </div>

            {/* CLIENT INFO */}
            <div className="text-right">
              <h3 className="font-bold text-base text-white truncate max-w-[140px]">
                @{nickname}
              </h3>
              <div className="flex justify-end mt-1">
                 <span className="text-[9px] font-medium text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Новий клієнт
                 </span>
              </div>
            </div>
        </div>

        {/* TIME & DATE */}
        <div className="bg-zinc-900/30 rounded-xl p-3 mb-4 border border-zinc-800/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                 <div className="bg-zinc-800/80 p-2 rounded-lg text-zinc-400">
                    <Clock size={18} />
                 </div>
                 <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-blue-400 font-bold uppercase mb-1">
                        {getDateLabel(req.date)}
                    </span>
                    <span className="text-3xl font-black text-white tracking-tight">
                        {req.time}
                    </span>
                 </div>
            </div>

            <div className="h-8 w-px bg-zinc-800"></div>

            <div className="flex-1 flex justify-end gap-1.5 flex-wrap">
                {req.services?.map((service: any, idx: number) => (
                   <span key={idx} className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-md text-[10px] font-medium text-zinc-400 whitespace-nowrap">
                     {service.name}
                   </span>
                ))}
            </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={(e) => onSkip(req.id, e)}
                className="py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-zinc-700"
            >
              <X size={14} />
              <span>ВІДХИЛИТИ</span>
            </button>
            
            <button 
              onClick={(e) => onAccept(req.id, e)}
              className="py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={14} />
              <span>ПРИЙНЯТИ</span>
            </button>
        </div>

      </div>
    </div>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ ---
export default function BarberDashboard() {
  const router = useRouter();
  const [barberName, setBarberName] = useState('Майстер');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ cash: 0, crypto: 0, pending: 0, completed: 0, total: 0 });

  useEffect(() => {
    const storedName = localStorage.getItem('barberName');
    if (storedName) setBarberName(storedName);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
      setAppointments(loadedData);
      
      let newStats = { cash: 0, crypto: 0, pending: 0, completed: 0, total: 0 };
      loadedData.forEach(app => {
        if (app.status === 'pending') newStats.pending++;
        if (app.status === 'confirmed') newStats.completed++;
        if (app.status === 'confirmed') {
           app.paymentMethod === 'crypto' ? newStats.crypto += Number(app.totalPrice) : newStats.cash += Number(app.totalPrice);
        }
      });
      newStats.total = newStats.pending + newStats.completed;
      setStats(newStats);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSkip = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Відхилити це замовлення?')) {
        await updateDoc(doc(db, 'bookings', orderId), { status: 'cancelled' });
    }
  };

  const handleAccept = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/barber/chat/${orderId}`);
  };

  const incomingRequests = appointments.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-sm border border-zinc-700 text-zinc-300">
            {barberName.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">{barberName}</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Online • Shift Started</p>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-green-950/30 border border-green-900/50 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[9px] text-green-400 font-bold tracking-wide">ACTIVE</span>
        </div>
      </header>

      <div className="px-4 space-y-3 pt-4">
        
        {/* STATS */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between h-20">
             <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Баланс</p>
             <div className="flex justify-between items-end">
                <span className="text-base font-bold text-white">{stats.cash} ₴</span>
                <span className="text-sm font-bold text-blue-400">{stats.crypto} T</span>
             </div>
          </div>
          <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between h-20">
             <div className="flex justify-between">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Черга</p>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                   <span className="text-[9px] text-zinc-400">{stats.completed} done</span>
                </div>
             </div>
             <span className="text-3xl font-black text-white leading-none">{stats.pending}</span>
          </div>
        </div>

        {/* LABEL */}
        <div className="flex items-center justify-between mt-4 ml-1">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                Вхідні запити
                {incomingRequests.length > 0 && (
                    <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                        {incomingRequests.length}
                    </span>
                )}
            </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-zinc-700 w-6 h-6" />
          </div>
        ) : incomingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-700 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
            <Coffee size={32} className="mb-2 opacity-20" />
            <p className="text-xs font-medium text-zinc-600">Запитів немає</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incomingRequests.map((req) => (
               <BookingCard 
                 key={req.id} 
                 req={req} 
                 onAccept={handleAccept} 
                 onSkip={handleSkip} 
               />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-800 p-2 pb-6 flex justify-around items-center z-50">
        <button onClick={() => router.push('/barber/dashboard')} className="p-2 flex flex-col items-center gap-1 text-white w-16 transition-transform active:scale-95">
          <Home size={22} className="text-white" />
        </button>
        <button onClick={() => router.push('/barber/schedule')} className="p-2 flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors w-16 active:scale-95">
          <Calendar size={22} />
        </button>
        <button className="p-2 flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors w-16 active:scale-95">
            <User size={22} />
        </button>
      </div>
    </div>
  );
}