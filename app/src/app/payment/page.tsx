"use client"; // Обов'язково, бо ми використовуємо useState

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Імпортуємо наш компонент (шлях базується на твоєму скріншоті)
import CryptoStatus from '@/components/payment/CryptoStatus'; 

export default function PaymentPage() {
  const router = useRouter();
  
  // Цей стан контролює, чи показувати вікно "Магія перевірки"
  const [isPaymentSent, setIsPaymentSent] = useState(false);

  // Твій тестовий гаманець (для USDT TRC20)
  const MY_WALLET = "TUe3d8...tviy_hamanet_tut"; 
  const PRICE = 15.02; // Унікальна сума для тесту

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h1 className="text-2xl font-bold mb-4 text-center">Оплата криптовалютою</h1>
        
        {/* Блок з QR кодом (можна додати картинку пізніше) */}
        <div className="bg-white p-4 rounded-xl mb-6 flex justify-center">
            {/* Тут буде QR код */}
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-black">
                QR CODE
            </div>
        </div>

        <div className="space-y-4 mb-8">
            <div className="bg-zinc-800 p-4 rounded-lg break-all">
                <p className="text-zinc-400 text-xs mb-1">Адреса гаманця (TRC20):</p>
                <p className="font-mono text-sm text-yellow-500">{MY_WALLET}</p>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Сума до сплати:</span>
                <span className="font-bold text-xl">{PRICE} USDT</span>
            </div>
        </div>

        {/* КНОПКА, ЯКУ НАТИСКАЄ КЛІЄНТ ПІСЛЯ ОПЛАТИ */}
        <button 
            onClick={() => setIsPaymentSent(true)}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all"
        >
            Я відправив кошти
        </button>

        <p className="text-center text-zinc-500 text-xs mt-4">
            Натисніть кнопку тільки після фактичної відправки коштів у вашому гаманці.
        </p>
      </div>

      {/* --- ОСЬ ТУТ НАША ІНТЕГРАЦІЯ --- */}
      {/* Якщо isPaymentSent === true, показуємо CryptoStatus */}
      {isPaymentSent && (
        <CryptoStatus 
           wallet={MY_WALLET}
           amount={PRICE}
           onSuccess={() => {
               // Куди перекидаємо після успіху? Наприклад, назад в бронювання
               router.push('/booking'); 
           }} 
        />
      )}

    </div>
  );
}