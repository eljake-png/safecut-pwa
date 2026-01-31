"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, Power, AlertTriangle, CalendarPlus, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// --- TИПИ ---
interface DaySchedule {
  active: boolean;
  start: string; 
  end: string;   
}

interface WeeklySchedule {
  [key: string]: DaySchedule; 
}

const DAYS_ORDER = ['1', '2', '3', '4', '5', '6', '0'];
const DAYS_LABELS: Record<string, string> = {
  '1': 'ПН', '2': 'ВТ', '3': 'СР', '4': 'ЧТ', '5': 'ПТ', '6': 'СБ', '0': 'НД'
};

// --- КОМПОНЕНТ СЛАЙДЕРА ---
const DualRangeSlider = ({ 
  start, 
  end, 
  onChange, 
  disabled 
}: { 
  start: number, 
  end: number, 
  onChange: (s: number, e: number) => void,
  disabled: boolean 
}) => {
  const min = 10; 
  const max = 21; 
  const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className={`relative w-full h-10 flex items-center ${disabled ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
      <div className="absolute left-0 w-full h-3 bg-zinc-800 rounded-full overflow-hidden z-0"></div>
      <div 
        className="absolute h-3 bg-blue-600 rounded-full z-0 shadow-[0_0_15px_rgba(37,99,235,0.6)]"
        style={{ left: `${getPercent(start)}%`, width: `${getPercent(end) - getPercent(start)}%` }}
      ></div>
      <input 
        type="range" min={min} max={max} step={1} value={start}
        onChange={(e) => { const val = Number(e.target.value); if (val < end) onChange(val, end); }}
        className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:h-12"
      />
      <div className="absolute w-7 h-7 bg-white border-4 border-blue-600 rounded-full shadow-xl z-10 pointer-events-none transition-transform" style={{ left: `calc(${getPercent(start)}% - 14px)` }}></div>
      <input 
        type="range" min={min} max={max} step={1} value={end}
        onChange={(e) => { const val = Number(e.target.value); if (val > start) onChange(start, val); }}
        className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:h-12"
      />
      <div className="absolute w-7 h-7 bg-white border-4 border-blue-600 rounded-full shadow-xl z-10 pointer-events-none transition-transform" style={{ left: `calc(${getPercent(end)}% - 14px)` }}></div>
    </div>
  );
};

export default function ScheduleSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Стан для тижневого графіку
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    '1': { active: true, start: '10:00', end: '19:00' }, 
    '2': { active: true, start: '10:00', end: '19:00' },
    '3': { active: true, start: '10:00', end: '19:00' },
    '4': { active: true, start: '10:00', end: '19:00' },
    '5': { active: true, start: '10:00', end: '19:00' },
    '6': { active: false, start: '11:00', end: '17:00' },
    '0': { active: false, start: '11:00', end: '17:00' },
  });

  // НОВИЙ СТАН: Масив дат-винятків (наприклад ['05.02.2026', '14.02.2026'])
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [newDayOffDate, setNewDayOffDate] = useState('');
  const [addingDayOff, setAddingDayOff] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      let bid = localStorage.getItem('safecut_barber_id');
      const bName = localStorage.getItem('barberName');

      if (!bid && bName) {
        try {
          const q = query(collection(db, 'barbers'), where('nickname', '==', bName));
          const snap = await getDocs(q);
          if (!snap.empty) {
            bid = snap.docs[0].id;
            localStorage.setItem('safecut_barber_id', bid);
          } else {
             const q2 = query(collection(db, 'barbers'), where('name', '==', bName));
             const snap2 = await getDocs(q2);
             if (!snap2.empty) {
                bid = snap2.docs[0].id;
                localStorage.setItem('safecut_barber_id', bid);
             }
          }
        } catch (err) { console.error(err); }
      }

      if (!bid) {
        alert("Помилка авторизації. ID не знайдено.");
        router.push('/');
        return;
      }

      setBarberId(bid);
      try {
        const docRef = doc(db, 'barbers', bid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
             const data = docSnap.data();
             if (data.schedule) setSchedule(data.schedule);
             // Завантажуємо існуючі вихідні
             if (data.daysOff) setDaysOff(data.daysOff);
        } else {
             console.error("ID exists but document missing");
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- ЛОГІКА ТИЖНЕВОГО ГРАФІКУ ---
  const handleToggleDay = (dayIndex: string) => {
    setErrorMsg(null);
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], active: !prev[dayIndex].active }
    }));
  };

  const handleSliderChange = (dayIndex: string, newStart: number, newEnd: number) => {
    setErrorMsg(null);
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], start: `${newStart}:00`, end: `${newEnd}:00` }
    }));
  };

  // --- ЛОГІКА "ОДИН ВИХІДНИЙ" (З ПЕРЕВІРКОЮ КОНФЛІКТІВ) ---
  const handleAddDayOff = async () => {
    if (!newDayOffDate || !barberId) return;
    setAddingDayOff(true);
    setErrorMsg(null);

    try {
        // 1. Форматуємо дату з input (YYYY-MM-DD) у наш формат (DD.MM.YYYY)
        const [year, month, day] = newDayOffDate.split('-');
        const formattedDate = `${day}.${month}.${year}`;

        // 2. Перевірка: чи вже є в списку
        if (daysOff.includes(formattedDate)) {
            setErrorMsg("Ця дата вже є у списку вихідних.");
            setAddingDayOff(false);
            return;
        }

        // 3. CONFLICT GUARD: Перевіряємо чи є замовлення на цю дату
        const q = query(
            collection(db, 'bookings'),
            where('barberId', '==', barberId),
            where('date', '==', formattedDate),
            where('status', 'in', ['pending', 'confirmed'])
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
            // КОНФЛІКТ ЗНАЙДЕНО!
            setErrorMsg(`Неможливо взяти вихідний ${formattedDate}. У вас є ${snap.size} активних замовлень на цей день.`);
            setAddingDayOff(false);
            return;
        }

        // 4. Якщо все ок - додаємо
        setDaysOff(prev => [...prev, formattedDate]);
        setNewDayOffDate(''); // Очистити інпут

    } catch (e) {
        console.error(e);
        setErrorMsg("Помилка при перевірці дати.");
    } finally {
        setAddingDayOff(false);
    }
  };

  const handleRemoveDayOff = (dateToRemove: string) => {
      setDaysOff(prev => prev.filter(d => d !== dateToRemove));
  };


  // --- ГЛОБАЛЬНА ПЕРЕВІРКА ПРИ ЗБЕРЕЖЕННІ ---
  const checkConflicts = async (newSchedule: WeeklySchedule): Promise<string | null> => {
    if (!barberId) return "Barber ID not found";

    const q = query(
      collection(db, 'bookings'),
      where('barberId', '==', barberId),
      where('status', 'in', ['pending', 'confirmed'])
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(d => d.data());

    for (const booking of bookings) {
      // Якщо ця дата у списку "Extra Days Off" - ми вже перевірили це при додаванні, 
      // АЛЕ якщо користувач додав вихідний, а потім хтось встиг забронювати (малоймовірно, але все ж)
      // Краще перевірятиму тут теж.
      if (daysOff.includes(booking.date)) {
         return `Конфлікт! Ви додали ${booking.date} як вихідний, але там з'явився запис (${booking.time}).`;
      }

      // Стандартна перевірка тижневого графіку (пропускаємо, якщо це Extra Day Off)
      if (daysOff.includes(booking.date)) continue;

      const [day, month, year] = booking.date.split('.').map(Number);
      const bookingDate = new Date(year, month - 1, day);
      if (bookingDate < new Date(new Date().setHours(0,0,0,0))) continue;

      const dayOfWeek = bookingDate.getDay().toString();
      const rule = newSchedule[dayOfWeek];

      if (!rule.active) {
        return `Конфлікт! ${booking.date} (${DAYS_LABELS[dayOfWeek]}) у вас запис о ${booking.time}. Ви не можете зробити цей день вихідним.`;
      }

      const bookingHour = parseInt(booking.time.split(':')[0]);
      const newStartHour = parseInt(rule.start.split(':')[0]);
      const newEndHour = parseInt(rule.end.split(':')[0]);

      if (bookingHour < newStartHour || bookingHour >= newEndHour) {
         return `Конфлікт! ${booking.date} у вас запис о ${booking.time}. Цей час випадає з нового графіку.`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!barberId) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      const conflictError = await checkConflicts(schedule);
      
      if (conflictError) {
        setErrorMsg(conflictError);
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      await updateDoc(doc(db, 'barbers', barberId), { 
        schedule: schedule,
        daysOff: daysOff, // Зберігаємо масив вихідних
        updatedAt: new Date()
      });
      
      router.back();
    } catch (e) {
      console.error(e);
      alert('Помилка збереження.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="px-4 py-4 flex items-center justify-between bg-black/90 backdrop-blur-xl border-b border-zinc-900 sticky top-0 z-30">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors p-2 -ml-2">
           <ChevronLeft size={28} />
        </button>
        <h1 className="font-bold text-lg tracking-wide uppercase text-zinc-200">Графік змін</h1>
        <div className="w-8"></div> 
      </header>

      {errorMsg && (
        <div className="p-4 bg-red-900/30 border-b border-red-500/30 flex items-start gap-3 animate-in slide-in-from-top-2">
           <AlertTriangle className="text-red-500 shrink-0" />
           <p className="text-sm font-bold text-red-200">{errorMsg}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 pb-32">
        {/* WEEKLY SCHEDULE */}
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2">Тижневий шаблон</h2>
          {DAYS_ORDER.map((dayIndex) => {
            const day = schedule[dayIndex];
            const startTime = parseInt(day.start.split(':')[0]);
            const endTime = parseInt(day.end.split(':')[0]);

            return (
              <div key={dayIndex} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${day.active ? 'bg-zinc-900/80 border-zinc-800' : 'bg-black border-zinc-900 opacity-60'}`}>
                <button onClick={() => handleToggleDay(dayIndex)} className={`w-14 h-14 shrink-0 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 ${day.active ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-zinc-800 text-zinc-500'}`}>
                  <span className="text-sm font-black">{DAYS_LABELS[dayIndex]}</span>
                  {day.active ? <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div> : <Power size={14} className="mt-1 opacity-50" />}
                </button>
                <div className="flex-1 flex flex-col justify-center h-14">
                   {day.active ? (
                     <>
                        <div className="flex justify-between items-center text-xs font-bold text-blue-200 mb-2 px-1">
                            <span>{day.start}</span>
                            <span className="opacity-30 h-px flex-1 bg-blue-500 mx-3"></span>
                            <span>{day.end}</span>
                        </div>
                        <DualRangeSlider start={startTime} end={endTime} disabled={!day.active} onChange={(s, e) => handleSliderChange(dayIndex, s, e)} />
                     </>
                   ) : (
                     <div className="flex items-center justify-start pl-2 h-full">
                       <span className="text-sm text-zinc-600 font-bold uppercase tracking-widest">Не працюю</span>
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ONE DAY OFF WIDGET */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CalendarPlus size={14} /> Додаткові вихідні
            </h2>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="date" 
                    value={newDayOffDate}
                    min={new Date().toISOString().split('T')[0]} // Не можна вибрати минуле
                    onChange={(e) => setNewDayOffDate(e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <button 
                    onClick={handleAddDayOff}
                    disabled={!newDayOffDate || addingDayOff}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 rounded-xl disabled:opacity-50 transition-colors"
                >
                    {addingDayOff ? <Loader2 className="animate-spin" size={18} /> : '+'}
                </button>
            </div>

            {daysOff.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {daysOff.map(date => (
                        <div key={date} className="bg-red-900/20 border border-red-500/30 text-red-200 px-3 py-1.5 rounded-lg text-sm font-mono flex items-center gap-2">
                            <span>{date}</span>
                            <button onClick={() => handleRemoveDayOff(date)} className="text-red-400 hover:text-white">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-zinc-600 italic">Немає запланованих додаткових вихідних</p>
            )}
        </div>
      </div>

      <div className="fixed bottom-6 left-4 right-4 z-30">
         <button onClick={handleSave} disabled={saving} className={`w-full text-black font-black text-lg py-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 ${errorMsg ? 'bg-red-500 text-white shadow-red-900/40' : 'bg-white'}`}>
            {saving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save size={24} />}
            <span>{errorMsg ? 'ВИПРАВТЕ ПОМИЛКУ' : 'ЗБЕРЕГТИ ЗМІНИ'}</span>
         </button>
      </div>
    </div>
  );
}