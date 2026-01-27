'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // State
  const [duration, setDuration] = useState(0);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Стан для відображення імені
  const [displayNickname, setDisplayNickname] = useState('...');

  // 1. Fetch Booking AND Client Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // А. Завантажуємо саме замовлення
        const bookingRef = doc(db, 'bookings', id);
        const bookingSnap = await getDoc(bookingRef);
        
        if (bookingSnap.exists()) {
          const bookingData = bookingSnap.data();
          setBooking(bookingData);
          
          // Початкове значення: нікнейм з замовлення або ID, або 'Гість'
          let finalName = bookingData.clientNickname || bookingData.clientId || 'Гість';

          // Б. Якщо є ID клієнта, пробуємо дістати свіжий нікнейм з бази clients
          if (bookingData.clientId) {
             try {
               const clientRef = doc(db, 'clients', bookingData.clientId);
               const clientSnap = await getDoc(clientRef);
               
               if (clientSnap.exists()) {
                 const clientData = clientSnap.data();
                 // Якщо знайшли профіль, беремо nickname або fullName
                 if (clientData.nickname) finalName = clientData.nickname;
                 else if (clientData.fullName) finalName = clientData.fullName;
               } else {
                 // Якщо профіль не знайдено, але ID є - показуємо ID, щоб бачити хто це
                 // (це допоможе нам зрозуміти, чи правильний ID записався)
                 if (bookingData.clientId !== 'temp_user_id') {
                    finalName = bookingData.clientId;
                 }
               }
             } catch (err) {
               console.error("Failed to fetch client profile:", err);
             }
          }
          
          setDisplayNickname(finalName);

        } else {
          router.push('/barber/dashboard');
        }
      } catch (e) {
        console.error("Error fetching session data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // 2. Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    if (!booking) return;

    if (confirm('Стрижку завершено? Оплату отримано?')) {
      try {
        await updateDoc(doc(db, 'bookings', id), {
            status: 'completed',
            completedAt: serverTimestamp(),
            durationSeconds: duration
        });

        router.push('/barber/dashboard');
      } catch (e) {
        console.error("Error finishing session:", e);
        alert("Помилка. Перевірте з'єднання.");
      }
    }
  };

  const handlePanic = () => {
    if (confirm('УВАГА! Ви дійсно хочете викликати службу безпеки?')) {
      setIsPanicMode(true);
      setTimeout(() => {
        alert('Сигнал SOS надіслано!');
      }, 1000);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center font-sans">
            <div className="text-zinc-500 animate-pulse">Завантаження...</div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isPanicMode ? 'bg-red-900 animate-pulse' : 'bg-black'}`}>
      
      {/* HEADER */}
      <div className="p-6 pt-8 flex justify-between items-start">
        <div>
          <h1 className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Клієнт</h1>
          <p className="text-2xl font-bold text-white mt-1">
            @{displayNickname}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono">#{id.slice(0, 6)}</span>
        </div>
        <div className="text-right">
          <h1 className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Час у роботі</h1>
          <p className="text-4xl font-black text-blue-500 font-mono mt-1">{formatTime(duration)}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
           <h3 className="text-zinc-500 text-xs uppercase mb-3">Послуги</h3>
           <ul className="space-y-3">
             {booking?.services?.map((service: any, index: number) => (
                <li key={index} className="flex items-center gap-3 text-white text-lg">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center text-xs border border-blue-600/30">✓</div>
                    {service.name}
                </li>
             ))}
           </ul>
        </div>
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
          <p className="text-zinc-500 text-sm text-center">
            🔒 Сесія записується. Ваша безпека під контролем SafeCut.
          </p>
        </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="p-6 pb-10 grid grid-cols-4 gap-4 bg-zinc-900 border-t border-zinc-800">
        <button 
          onClick={handlePanic}
          className="col-span-1 bg-zinc-800 hover:bg-red-900/50 text-red-500 border border-red-900/30 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">🚨</span>
          <span className="text-[10px] font-bold uppercase">SOS</span>
        </button>
        
        <button 
          onClick={handleFinish}
          className="col-span-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-2xl shadow-[0_0_20px_rgba(22,163,74,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>ЗАВЕРШИТИ</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-mono">
             {booking?.totalPrice} {booking?.paymentMethod === 'crypto' ? 'USDT' : '₴'}
          </span>
        </button>
      </div>
    </div>
  );
}