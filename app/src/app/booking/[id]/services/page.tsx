'use client';

import Link from 'next/link';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
// Додаємо doc та getDoc для отримання даних клієнта перед записом
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'; 
import { db } from '@/lib/firebase'; 

export default function ServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // --- БАЗА ДАНИХ ПОСЛУГ ---
  const [services, setServices] = useState([
    { id: 'haircut', name: 'Чоловіча стрижка', price: 500, selected: true, locked: true },
    { id: 'beard', name: 'Стрижка бороди', price: 100, selected: false, locked: false },
    { id: 'family', name: 'Батько і Син', price: 300, selected: false, locked: false },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'crypto'>('cash');
  const [isProcessing, setIsProcessing] = useState(false); // Щоб не натиснули двічі

  const toggleService = (serviceId: string) => {
    setServices(services.map(s => {
      if (s.id === serviceId && !s.locked) {
        return { ...s, selected: !s.selected };
      }
      return s;
    }));
  };

  const totalPrice = services.reduce((acc, s) => s.selected ? acc + s.price : acc, 0);

  // --- ОНОВЛЕНА ФУНКЦІЯ handleNext ---
  const handleNext = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // 1. Читаємо збережені дату і час чернетки
    const savedData = localStorage.getItem('safecut_draft');
    
    if (!savedData) {
      alert("Помилка: Не обрано час візиту. Поверніться назад.");
      setIsProcessing(false);
      return;
    }

    const { date, time, barberName } = JSON.parse(savedData);

    // 2. ОТРИМУЄМО РЕАЛЬНОГО КЛІЄНТА
    // Припускаємо, що при логіні ми зберегли ID в localStorage під ключем 'clientId' або 'userId'
    // Якщо немає - використовуємо 'tester_client01' як фолбек для тестів
    const currentClientId = localStorage.getItem('clientId') || 'tester_client01';
    let clientNickname = 'Гість';

    try {
        // Пробуємо дістати нікнейм з бази, щоб зберегти його в замовленні
        // Це важливо для швидкодії Dashboard барбера
        const clientDoc = await getDoc(doc(db, 'clients', currentClientId));
        if (clientDoc.exists()) {
            const data = clientDoc.data();
            clientNickname = data.nickname || data.fullName || 'Клієнт';
        }
    } catch (error) {
        console.log("Не вдалося отримати профіль клієнта, використовуємо дефолтний");
    }

    // 3. Формуємо об'єкт для бази даних
    const orderData = {
        barberId: id,
        barberName: barberName,
        
        // ВАЖЛИВІ ВИПРАВЛЕННЯ:
        clientId: currentClientId, // Реальний ID
        clientNickname: clientNickname, // Реальний нікнейм (snapshot)
        
        date: date,
        time: time,
        services: services.filter(s => s.selected),
        totalPrice: totalPrice,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date(),
    };

    try {
        // 4. Відправляємо в Firebase
        const docRef = await addDoc(collection(db, 'bookings'), orderData);
        
        localStorage.setItem(`order_status_${docRef.id}`, 'pending');
        localStorage.removeItem('safecut_draft');

        console.log("Order created with ID: ", docRef.id);

        if (paymentMethod === 'crypto') {
          router.push(`/booking/${id}/crypto?amount=${totalPrice}&orderId=${docRef.id}`);
        } else {
          router.push(`/booking/${id}/success?orderId=${docRef.id}`); 
        }
    } catch (e) {
        console.error("Error creating order:", e);
        alert("Щось пішло не так при створенні замовлення");
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans flex flex-col items-center pb-32">
      
      {/* Header */}
      <header className="w-full max-w-md p-6 flex items-center justify-between">
        <Link href={`/booking/${id}`}>
          <button className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            ← Назад
          </button>
        </Link>
        <h1 className="font-bold text-lg uppercase tracking-widest">Послуги</h1>
        <div className="w-8"></div>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col gap-8">
        
        {/* Список послуг */}
        <div className="space-y-3">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer
                ${service.selected 
                  ? 'bg-white dark:bg-zinc-900 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors
                  ${service.selected ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 dark:border-zinc-600'}`}>
                  {service.selected && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{service.name}</span>
                  {service.locked && <span className="text-xs text-zinc-400">Обов'язково</span>}
                </div>
              </div>
              
              <span className="font-mono text-lg">{service.price} ₴</span>
            </div>
          ))}
        </div>

        {/* Метод оплати */}
        <div>
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Оплата</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-xl border font-bold text-center transition-all
                ${paymentMethod === 'cash' 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}
            >
              💵 Готівкою
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`p-4 rounded-xl border font-bold text-center transition-all
                ${paymentMethod === 'crypto' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}
            >
              💎 Crypto
            </button>
          </div>
        </div>

      </main>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-md mx-auto flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">До сплати</span>
            <span className="text-2xl font-black">{totalPrice} ₴</span>
          </div>
          
          <button 
            onClick={handleNext}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center"
          >
            {isProcessing ? 'Обробка...' : (paymentMethod === 'crypto' ? 'ОПЛАТИТИ USDT' : 'ЗАМОВИТИ')}
          </button>
        </div>
      </div>

    </div>
  );
}