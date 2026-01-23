import React from 'react';
import { useCryptoPaymentVerifier } from '@/hooks/useCryptoPaymentVerifier';

interface Props {
  wallet: string;
  amount: number;
  onSuccess: () => void;
}

export default function CryptoStatus({ wallet, amount, onSuccess }: Props) {
  const { status, error } = useCryptoPaymentVerifier(wallet, amount);

  // Автоматичний перехід далі при успіху
  React.useEffect(() => {
    if (status === 'confirmed') {
      setTimeout(onSuccess, 2000);
    }
  }, [status, onSuccess]);

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        
        {/* АНІМАЦІЇ */}
        <div className="flex justify-center mb-6">
          {status === 'searching' && (
            <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          )}
          
          {status === 'found' && (
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
               <span className="text-2xl">🔎</span>
            </div>
          )}

          {status === 'confirmed' && (
             <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
               <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
             </div>
          )}
           {status === 'error' && (
             <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
               <span className="text-2xl">⚠️</span>
             </div>
          )}
        </div>

        {/* ТЕКСТИ ВІД АГЕНТА */}
        <h3 className="text-xl font-bold text-white mb-2">
          {status === 'searching' && "Магія перевірки..."}
          {status === 'found' && "Транзакцію знайдено!"}
          {status === 'confirmed' && "Оплату підтверджено!"}
          {status === 'error' && "Не бачимо оплати"}
        </h3>

        <p className="text-zinc-400 text-sm">
          {status === 'searching' && "Шукаємо ваші кошти в мережі TRON. Це зазвичай займає 1-2 хвилини."}
          {status === 'found' && "Перевіряємо кількість підтверджень блоку..."}
          {status === 'confirmed' && "Дякуємо! Переводимо вас до замовлення."}
          {status === 'error' && "Ми не знайшли транзакцію протягом 10 хвилин. Якщо ви оплатили, натисніть кнопку підтримки."}
        </p>

        {status === 'error' && (
          <button className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-medium transition-colors">
            Зв'язатися з підтримкою
          </button>
        )}
      </div>
    </div>
  );
}