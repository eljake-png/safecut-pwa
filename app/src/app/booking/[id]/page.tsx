'use client';

import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const barbersDB: { [key: string]: string } = {
    '1': 'Іван',
    '2': 'Максим'
  };
  const barberName = barbersDB[id] || 'Майстер';

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Базові слоти (у реальності приходять з БД)
  // isBooked: true імітує, що хтось вже зайняв цей час
  const baseSlots = [
    { time: '10:00', isBooked: false },
    { time: '12:00', isBooked: false },
    { time: '14:00', isBooked: true }, // Зайнято іншим клієнтом
    { time: '16:00', isBooked: false },
    { time: '18:00', isBooked: false },
    { time: '20:00', isBooked: false }
  ];

  const [timeSlots, setTimeSlots] = useState(baseSlots.map(s => ({ ...s, isDisabled: s.isBooked })));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // --- ЛОГІКА ЧАСУ (ВИПРАВЛЕНО) ---
  useEffect(() => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    const updatedSlots = baseSlots.map(slot => {
      // 1. Якщо вже зайнято в базі — блокуємо
      if (slot.isBooked) return { ...slot, isDisabled: true };

      // 2. Якщо це сьогодні і час вже минув — блокуємо
      if (isToday) {
        const slotHour = parseInt(slot.time.split(':')[0], 10);
        // Якщо слот менше або дорівнює поточній годині (наприклад, зараз 12:15, то слот 12:00 вже недоступний)
        if (slotHour <= currentHour) {
          return { ...slot, isDisabled: true };
        }
      }

      // Інакше доступно
      return { ...slot, isDisabled: false };
    });

    setTimeSlots(updatedSlots);
    
    // Якщо ми змінили дату і обраний раніше час став недоступним — скидаємо вибір
    setSelectedTimeSlot(null);

  }, [selectedDate]); // Перераховуємо при зміні дати

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
          <div className="grid grid-cols-3 gap-3">
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
