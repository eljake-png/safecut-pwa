"use client";

import React, { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import CryptoStatus from '@/components/payment/CryptoStatus';

export default function BookingCryptoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const amountParam = searchParams.get('amount');
  const PRICE = amountParam ? parseFloat(amountParam) : 15.02; 

  const [isPaymentSent, setIsPaymentSent] = useState(false);
  const MY_WALLET = "TJ4k3...demo_wallet_address"; 

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h1 className="text-2xl font-bold mb-4 text-center">Оплата замовлення #{params.id}</h1>
        
        <div className="bg-white p-4 rounded-xl mb-6 flex justify-center">
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-black font-mono text-xs text-center p-2">
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

        {/* Кнопка лише змінює стан */}
        <button 
            onClick={() => setIsPaymentSent(true)}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all active:scale-95"
        >
            Я відправив кошти
        </button>

        <p className="text-center text-zinc-500 text-xs mt-4">
            Натисніть кнопку тільки після фактичної відправки коштів.
        </p>
      </div>

      {/* Модальне вікно */}
      {isPaymentSent && (
        <CryptoStatus 
           wallet={MY_WALLET}
           amount={PRICE}
           onSuccess={() => {
               // Цей код виконається ТІЛЬКИ коли CryptoStatus дасть добро
               router.push(`/booking/${params.id}/success`); 
           }} 
        />
      )}
    </div>
  );
}
