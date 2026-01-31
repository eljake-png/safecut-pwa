'use client';

import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2, CalendarX } from 'lucide-react';

// Дефолтний графік, якщо у барбера ще немає налаштувань (аварійний режим)
const DEFAULT_SCHEDULE = {
  start: '10:00', end: '19:00', active: true
};

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [barberName, setBarberName] = useState('Майстер');
  // В цей стейт ми завантажимо ВЕСЬ об'єкт schedule з бази
  const [schedule, setSchedule] = useState<any>(null); 
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  
  const [timeSlots, setTimeSlots] = useState<{time: string, isDisabled: boolean}[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isDayOff, setIsDayOff] = useState(false);

  // 1. ЗАВАНТАЖУЄМО БАРБЕРА ТА ЙОГО ГРАФІК
  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const docRef = doc(db, 'barbers', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBarberName(data.fullName || data.nickname || 'Майстер');
          if (data.schedule) {
             setSchedule(data.schedule);
          }
        }
      } catch (e) {
        console.error("Error fetching barber", e);
      } finally {
        setLoadingSchedule(false);
      }
    };
    fetchBarber();
  }, [id]);

  // 2. ЗАВАНТАЖУЄМО ЗАЙНЯТІ ГОДИНИ
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const dateString = selectedDate.toLocaleDateString('uk-UA'); 
        const q = query(
          collection(db, 'bookings'),
          where('barberId', '==', id),
          where('date', '==', dateString),
          where('status', 'in', ['pending', 'confirmed']) // Ігноруємо скасовані
        );
        const querySnapshot = await getDocs(q);
        const bookedTimes = querySnapshot.docs.map(doc => doc.data().time);
        setTakenSlots(bookedTimes);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };

    fetchBookings();
    setSelectedTimeSlot(null);
  }, [selectedDate, id]);

  // 3. ГЕНЕРАЦІЯ СЛОТІВ НА ОСНОВІ ГРАФІКУ
  useEffect(() => {
    if (loadingSchedule) return;

    // 1. Визначаємо день тижня (0-6)
    const dayOfWeek = selectedDate.getDay().toString(); // '0' = Нд, '1' = Пн
    
    // 2. Беремо правило для цього дня. Якщо графіка немає - фолбек
    const dayRule = schedule ? schedule[dayOfWeek] : DEFAULT_SCHEDULE;

    // 3. Якщо день вимкнений (active: false) -> Вихідний
    if (dayRule && !dayRule.active) {
       setIsDayOff(true);
       setTimeSlots([]);
       return;
    }

    setIsDayOff(false);

    // 4. Парсимо години (Start / End)
    // Якщо графіка немає взагалі (старий барбер), беремо 10-19
    const startHour = dayRule ? parseInt(dayRule.start.split(':')[0]) : 10;
    const endHour = dayRule ? parseInt(dayRule.end.split(':')[0]) : 19;

    // 5. Генеруємо масив годин (наприклад [10, 11, ... 18])
    // endHour не включаємо (якщо працює до 19:00, остання стрижка о 18:00)
    const generatedSlots = [];
    for (let h = startHour; h < endHour; h++) {
       generatedSlots.push(`${h}:00`);
    }

    // 6. Фільтруємо (Зайнято + Минулий час)
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    const finalSlots = generatedSlots.map(time => {
      const isTaken = takenSlots.includes(time);
      if (isTaken) return { time, isDisabled: true };

      if (isToday) {
        const slotHour = parseInt(time.split(':')[0]);
        if (slotHour <= currentHour) return { time, isDisabled: true };
      }

      return { time, isDisabled: false };
    });

    setTimeSlots(finalSlots);

  }, [selectedDate, schedule, loadingSchedule, takenSlots]);

  const daysOfWeek = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  const currentWeekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const handleNext = () => {
    const draftData = {
        barberId: id,
        barberName: barberName,
        date: selectedDate.toLocaleDateString('uk-UA'), 
        time: selectedTimeSlot,
        timestamp: selectedDate.toISOString() 
    };
    
    localStorage.setItem('safecut_draft', JSON.stringify(draftData));
    router.push(`/booking/${id}/services`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans flex flex-col items-center pb-24">
      
      {/* Header */}
      <header className="w-full max-w-md p-6 flex items-center justify-between sticky top-0 bg-zinc-50/90 dark:bg-black/90 backdrop-blur-md z-10">
        <Link href="/">
          <button className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            ← Назад
          </button>
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Твій барбер</span>
          <h1 className="font-bold text-lg">{barberName}</h1>
        </div>
        <div className="w-8"></div>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col gap-8">
        
        {/* Calendar Row */}
        <div>
          <h2 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-widest ml-1">Обери дату</h2>
          
          {/* ЗМІНИ ТУТ: прибрав overflow-x-auto, додав w-full і менший gap */}
          <div className="flex w-full gap-1.5 justify-between">
            {currentWeekDates.map((date, index) => {
              const isSelected = selectedDate.toDateString() === date.toDateString();
              
              const dayIdx = date.getDay().toString();
              const isDayOffInSchedule = schedule && schedule[dayIdx] && !schedule[dayIdx].active;

              return (
                <div 
                  key={index} 
                  onClick={() => handleDateClick(date)}
                  // ЗМІНИ ТУТ: додав flex-1 (щоб розтягувалось) і прибрав min-w
                  className={`flex-1 flex flex-col items-center justify-center h-20 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden
                    ${isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40' 
                      : isDayOffInSchedule
                        ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-50'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'}`}
                >
                  <span className="text-[10px] opacity-60 mb-0.5 uppercase">{daysOfWeek[date.getDay()]}</span>
                  <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                  
                  {isDayOffInSchedule && !isSelected && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40">
                        <div className="w-6 h-0.5 bg-zinc-400/50 rotate-45"></div>
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slots Grid */}
        <div className="min-h-[200px]">
          <h2 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-widest ml-1">Обери час</h2>
          
          {loadingSchedule ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-zinc-500" />
             </div>
          ) : isDayOff ? (
             <div className="flex flex-col items-center justify-center py-10 text-zinc-500 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 animate-in fade-in zoom-in-95">
                <CalendarX size={48} className="mb-3 opacity-50" />
                <p className="font-medium">Барбер відпочиває 😴</p>
                <p className="text-xs mt-1">Обери іншу дату</p>
             </div>
          ) : timeSlots.length === 0 ? (
             <div className="text-center py-10 text-zinc-500">
                <p>Немає вільних слотів на цей день</p>
             </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  disabled={slot.isDisabled}
                  onClick={() => !slot.isDisabled && setSelectedTimeSlot(slot.time)}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95
                    ${slot.isDisabled 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 border-transparent cursor-not-allowed decoration-slice' 
                      : selectedTimeSlot === slot.time
                        ? 'bg-white dark:bg-white text-black border-blue-500 ring-2 ring-blue-500 shadow-xl shadow-blue-900/20 scale-[1.02]'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-500'
                    }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Action Button */}
      <div className="fixed bottom-8 left-0 w-full px-6 flex justify-center pointer-events-none z-20">
        <button 
          onClick={handleNext}
          disabled={!selectedTimeSlot}
          className="pointer-events-auto w-full max-w-md bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/30 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
        >
          ЗАБРОНЮВАТИ
        </button>
      </div>
    </div>
  );

  function handleDateClick(date: Date) {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Скидаємо вибір при зміні дати
  }
}