'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// Переконайся, що шлях правильний
import { incrementHaircutCount } from '@/lib/loyalty'; 

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [duration, setDuration] = useState(0);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayNickname, setDisplayNickname] = useState('...');

  // 1. Завантаження даних
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingRef = doc(db, 'bookings', id);
        const bookingSnap = await getDoc(bookingRef);
        
        if (!bookingSnap.exists()) {
          router.push('/barber/dashboard');
          return;
        }

        const bookingData = bookingSnap.data();
        setBooking(bookingData);
        
        // Визначення імені
        let finalName = bookingData.clientNickname || bookingData.clientId || 'Гість';

        if (bookingData.clientId && bookingData.clientId !== 'temp_user_id') {
            try {
              const clientRef = doc(db, 'clients', bookingData.clientId);
              const clientSnap = await getDoc(clientRef);
              if (clientSnap.exists()) {
                const cData = clientSnap.data();
                finalName = cData.nickname || cData.fullName || finalName;
              }
            } catch (err) {
              console.error("Client fetch error:", err);
            }
        }
        setDisplayNickname(finalName);
      } catch (e) {
        console.error("Session fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // 2. Таймер
  useEffect(() => {
    const timer = setInterval(() => setDuration(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- ФУНКЦІЯ ЗАВЕРШЕННЯ (ВИПРАВЛЕНА) ---
  const handleFinish = async () => {
    if (!booking) return;

    // Використовуємо window.confirm для надійності
    const ok = window.confirm('Стрижку завершено? Оплату отримано?');
    if (!ok) return;

    try {
      // 1. Оновлення статусу
      await updateDoc(doc(db, 'bookings', id), {
          status: 'completed',
          completedAt: serverTimestamp(),
          durationSeconds: duration
      });

      // 2. Лояльність
      if (booking.clientId && booking.clientId !== 'temp_user_id') {
         try {
           console.log("Adding loyalty point...");
           await incrementHaircutCount(booking.clientId);
         } catch (loyaltyErr) {
           console.error("Loyalty error:", loyaltyErr);
         }
      }

      // 3. Перехід
      router.push('/barber/dashboard');

    } catch (e) {
      console.error("Finish error:", e);
      alert("Помилка збереження!");
    }
  };

  const handlePanic = () => {
    if (window.confirm('УВАГА! Викликати охорону?')) {
      setIsPanicMode(true);
      setTimeout(() => alert('SOS надіслано!'), 1000);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center">Завантаження...</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isPanicMode ? 'bg-red-900 animate-pulse' : 'bg-black'}`}>
      
      {/* HEADER */}
      <div className="p-6 pt-8 flex justify-between items-start">
        <div>
          <h1 className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Клієнт</h1>
          <p className="text-2xl font-bold text-white mt-1">@{displayNickname}</p>
          <span className="text-[10px] text-zinc-500 font-mono">#{id.slice(0, 6)}</span>
        </div>
        <div>
          <h1 className="text-zinc-400 text-xs uppercase tracking-widest font-bold text-right">Час</h1>
          <p className="text-4xl font-black text-blue-500 font-mono mt-1">{formatTime(duration)}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
           <h3 className="text-zinc-500 text-xs uppercase mb-3">Послуги</h3>
           <ul className="space-y-3">
             {booking?.services?.map((service: any, idx: number) => (
                <li key={idx} className="flex items-center gap-3 text-white text-lg">
                    <span className="text-blue-500">✓</span> {service.name}
                </li>
             ))}
           </ul>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-6 pb-10 grid grid-cols-4 gap-4 bg-zinc-900 border-t border-zinc-800">
        <button 
          onClick={handlePanic}
          className="col-span-1 bg-zinc-800 text-red-500 border border-red-900/30 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all"
        >
          <span className="text-2xl">🚨</span>
          <span className="text-[10px] font-bold">SOS</span>
        </button>
        
        <button 
          onClick={handleFinish}
          className="col-span-3 bg-green-600 text-white font-bold text-xl rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>ЗАВЕРШИТИ</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-mono">
             {booking?.totalPrice}₴
          </span>
        </button>
      </div>
    </div>
  );
}