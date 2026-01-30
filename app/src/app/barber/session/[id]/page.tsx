'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Diamond, Banknote, Gift } from 'lucide-react'; // Додав іконку подарунка
// Імпортуємо логіку лояльності (шлях може відрізнятись залежно від структури, припускаю @/lib/loyalty)
import { getLoyaltyData, incrementHaircutCount } from '@/lib/loyalty'; 

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // State
  const [duration, setDuration] = useState(0);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [displayNickname, setDisplayNickname] = useState('...');
  
  // Лояльність
  const [isFreeCut, setIsFreeCut] = useState(false);
  const [currentHaircutNum, setCurrentHaircutNum] = useState(0);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingRef = doc(db, 'bookings', id);
        const bookingSnap = await getDoc(bookingRef);
        
        if (bookingSnap.exists()) {
          const bookingData = bookingSnap.data();
          setBooking(bookingData);
          
          let finalName = bookingData.clientNickname || bookingData.clientId || 'Гість';
          let clientId = bookingData.clientId;

          if (clientId && clientId !== 'temp_user_id') {
             try {
               // А. Отримуємо нікнейм
               const clientRef = doc(db, 'clients', clientId);
               const clientSnap = await getDoc(clientRef);
               
               if (clientSnap.exists()) {
                 const clientData = clientSnap.data();
                 if (clientData.nickname) finalName = clientData.nickname;
                 else if (clientData.fullName) finalName = clientData.fullName;
               } else {
                  finalName = clientId;
               }

               // Б. Перевіряємо ЛОЯЛЬНІСТЬ
               // Дізнаємось, скільки стрижок було ДО цієї
               const loyalty = await getLoyaltyData(clientId);
               const count = loyalty.haircutsCount || 0;
               // Поточна стрижка - це (count + 1)
               const thisHaircutNum = count + 1;
               
               setCurrentHaircutNum(thisHaircutNum);

               // Якщо це 10-та, 20-та і т.д. - вона безкоштовна
               if (thisHaircutNum > 0 && thisHaircutNum % 10 === 0) {
                 setIsFreeCut(true);
               }

             } catch (err) {
               console.error("Failed to fetch client profile/loyalty:", err);
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

  // 2. Timer
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

    // Формуємо повідомлення для підтвердження залежно від оплати
    const confirmMsg = isFreeCut 
      ? 'УВАГА: Ця стрижка БЕЗКОШТОВНА (Bonus). Завершити?' 
      : 'Стрижку завершено? Оплату отримано?';

    if (confirm(confirmMsg)) {
      try {
        // 1. Оновлюємо статус замовлення
        // Важливо: записуємо фінальну ціну (0 якщо бонус, або повну)
        await updateDoc(doc(db, 'bookings', id), {
            status: 'completed',
            completedAt: serverTimestamp(),
            durationSeconds: duration,
            finalPrice: isFreeCut ? 0 : booking.totalPrice, // Зберігаємо факт, що ціна була 0
            isBonusCut: isFreeCut // Маркер для історії
        });

        // 2. Інкрементуємо лічильник стрижок клієнта
        if (booking.clientId && booking.clientId !== 'temp_user_id') {
           await incrementHaircutCount(booking.clientId);
        }

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
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] text-zinc-500 font-mono">#{id.slice(0, 6)}</span>
             {/* Відображаємо номер стрижки */}
             <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-blue-400 px-1.5 py-0.5 rounded">
                Стрижка #{currentHaircutNum}
             </span>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Час у роботі</h1>
          <p className="text-4xl font-black text-blue-500 font-mono mt-1">{formatTime(duration)}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        
        {/* BONUS ALERT */}
        {isFreeCut && (
           <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/50 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-blue-600 p-3 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] animate-pulse">
                 <Gift size={24} className="text-white" />
              </div>
              <div>
                 <h3 className="text-blue-400 font-black text-lg uppercase tracking-wide">BONUS CUT!</h3>
                 <p className="text-blue-200/70 text-xs">Ця стрижка для клієнта <b>безкоштовна</b>.</p>
              </div>
           </div>
        )}

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
          className={`col-span-3 font-bold text-xl rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg
            ${isFreeCut 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30' 
                : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/30'
            }`}
        >
          <span>ЗАВЕРШИТИ</span>
          
          {/* Динамічна ціна */}
          {isFreeCut ? (
             <span className="bg-white/20 px-3 py-1 rounded text-sm font-mono font-black animate-pulse">
                FREE
             </span>
          ) : (
             <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-mono flex items-center gap-1">
                {booking?.totalPrice} 
                {booking?.paymentMethod === 'crypto' ? <Diamond size={12}/> : '₴'}
             </span>
          )}
        </button>
      </div>
    </div>
  );
}