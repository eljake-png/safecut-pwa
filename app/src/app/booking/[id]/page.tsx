'use client';

import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Стандартні робочі години (можна винести в конфиг)
const RAW_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // Стейт для барбера і слотів
  const [barberName, setBarberName] = useState('Майстер');
  const [loadingData, setLoadingData] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [takenSlots, setTakenSlots] = useState<string[]>([]); // Зайняті години з бази
  
  const [timeSlots, setTimeSlots] = useState(RAW_SLOTS.map(time => ({ time, isDisabled: false })));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // 1. ЗАВАНТАЖУЄМО БАРБЕРА
  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const docRef = doc(db, 'barbers', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Пріоритет: fullName -> nickname -> 'Майстер'
          setBarberName(data.fullName || data.nickname || 'Майстер');
        }
      } catch (e) {
        console.error("Error fetching barber", e);
      }
    };
    fetchBarber();
  }, [id]);

  // 2. ЗАВАНТАЖУЄМО ЗАЙНЯТІ ГОДИНИ ПРИ ЗМІНІ ДАТИ
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingData(true);
      try {
        // Форматуємо дату у стрічку YYYY-MM-DD для пошуку в базі
        // (Важливо: при збереженні замовлення ми будемо використовувати цей же формат)
        const dateString = selectedDate.toLocaleDateString('uk-UA'); 

        const q = query(
          collection(db, 'bookings'),
          where('barberId', '==', id),
          where('date', '==', dateString)
        );

        const querySnapshot = await getDocs(q);
        const bookedTimes = querySnapshot.docs.map(doc => doc.data().time);
        setTakenSlots(bookedTimes);
      } catch (error) {
        console.error("Error fetching slots:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchBookings();
    setSelectedTimeSlot(null); // Скидаємо вибір часу при зміні дати
  }, [selectedDate, id]);

  // 3. ЛОГІКА БЛОКУВАННЯ (Минулий час + Зайнято в базі)
  useEffect(() => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    const updatedSlots = RAW_SLOTS.map(time => {
      // А. Перевірка бази (чи зайнято кимось іншим)
      const isTakenInDb = takenSlots.includes(time);
      if (isTakenInDb) return { time, isDisabled: true };

      // Б. Перевірка минулого часу (якщо сьогодні)
      if (isToday) {
        const slotHour = parseInt(time.split(':')[0], 10);
        if (slotHour <= currentHour) {
          return { time, isDisabled: true };
        }
      }

      // Доступно
      return { time, isDisabled: false };
    });

    setTimeSlots(updatedSlots);
  }, [selectedDate, takenSlots]); 

  const daysOfWeek = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  const currentWeekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNext = () => {
    // ЗБЕРІГАЄМО В ПАМ'ЯТЬ ДЛЯ НАСТУПНОГО КРОКУ
    const draftData = {
        barberId: id,
        barberName: barberName,
        date: selectedDate.toLocaleDateString('uk-UA'), // Формат: дд.мм.рррр
        time: selectedTimeSlot,
        timestamp: selectedDate.toISOString() // Для сортування, якщо треба
    };
    
    localStorage.setItem('safecut_draft', JSON.stringify(draftData));
    
    // Перехід на Екран 3 (Послуги)
    router.push(`/booking/${id}/services`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-md p-6 flex items-center justify-between">
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
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Обери дату</h2>
          <div className="flex justify-between overflow-x-auto pb-2 no-scrollbar">
            {currentWeekDates.map((date, index) => {
              const isSelected = selectedDate.toDateString() === date.toDateString();
              return (
                <div 
                  key={index} 
                  onClick={() => handleDateClick(date)}
                  className={`flex flex-col items-center justify-center min-w-[3.5rem] h-20 rounded-2xl cursor-pointer transition-all duration-200 border 
                    ${isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'}`}
                >
                  <span className="text-xs opacity-60 mb-1">{daysOfWeek[date.getDay()]}</span>
                  <span className="text-xl font-bold">{date.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slots Grid */}
        <div>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Обери час</h2>
          <div className={`grid grid-cols-3 gap-3 ${loadingData ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                disabled={slot.isDisabled}
                onClick={() => !slot.isDisabled && setSelectedTimeSlot(slot.time)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-200
                  ${slot.isDisabled 
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 border-transparent cursor-not-allowed decoration-slice' 
                    : selectedTimeSlot === slot.time
                      ? 'bg-white dark:bg-white text-black border-blue-500 ring-2 ring-blue-500 shadow-lg'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-8 left-0 w-full px-6 flex justify-center pointer-events-none">
          <button 
            onClick={handleNext}
            disabled={!selectedTimeSlot}
            className="pointer-events-auto w-full max-w-md bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95"
          >
            ЗАБРОНЮВАТИ
          </button>
        </div>

      </main>
    </div>
  );
}