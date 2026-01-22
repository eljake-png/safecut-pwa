'use client';

import Link from 'next/link';
import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CryptoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const amountUAH = Number(searchParams.get('amount')) || 0;
  const exchangeRate = 42.5;
  const amountUSDT = (amountUAH / exchangeRate).toFixed(2);
  
  const walletAddress = "TLvGM6i5aJ8j9k3R2y1z5x4Q7p8s9T2u1v";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaid = () => {
    router.push(`/booking/${id}/success`);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans flex flex-col items-center pb-8">
      
      <header className="w-full max-w-md p-6 flex items-center justify-between">
        <Link href={`/booking/${id}/services`}>
          <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            ← Назад
          </button>
        </Link>
        <h1 className="font-bold text-lg text-blue-500">Crypto Payment</h1>
        <div className="w-8"></div>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col items-center gap-6">
        
        <div className="text-center">
          <p className="text-zinc-400 text-sm uppercase tracking-wider mb-1">До сплати</p>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-white">{amountUSDT} USDT</span>
            <span className="text-sm text-zinc-500">≈ {amountUAH} UAH</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-2xl shadow-blue-900/20 mt-2">
          <div className="w-48 h-48 bg-black relative overflow-hidden grid grid-cols-6 grid-rows-6 gap-1 p-2">
             <div className="bg-white col-span-2 row-span-2 rounded-sm"></div>
             <div className="bg-white col-span-2 row-span-2 col-start-5 rounded-sm"></div>
             <div className="bg-white col-span-2 row-span-2 row-start-5 rounded-sm"></div>
             <div className="bg-white col-start-3 row-start-3"></div>
             <div className="bg-white col-start-4 row-start-4"></div>
             <div className="bg-white col-start-2 row-start-5"></div>
             <div className="bg-white col-start-5 row-start-3"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-blue-600 rounded-full p-2">
                   <span className="text-xs font-bold text-white">TRX</span>
                </div>
             </div>
          </div>
        </div>

        <div className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Мережа</span>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"></span>
                <span className="font-bold">Tron (TRC20)</span>
            </div>
        </div>

        <div className="w-full">
            <p className="text-zinc-400 text-xs mb-2 ml-1">Адреса гаманця</p>
            <div 
                onClick={handleCopy}
                className="w-full bg-zinc-800 border border-zinc-700 hover:border-blue-500 hover:bg-zinc-700/80 transition-all cursor-pointer p-4 rounded-2xl flex items-center justify-between group"
            >
                <div className="flex flex-col overflow-hidden">
                    <span className="font-mono text-sm text-zinc-300 truncate w-64">
                        {walletAddress}
                    </span>
                    <span className="text-[10px] text-zinc-500 group-hover:text-blue-400 transition-colors">
                        Натисніть, щоб скопіювати
                    </span>
                </div>
                <div className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-500' : 'bg-zinc-900 text-zinc-400'}`}>
                    {copied ? '✓' : '❐'}
                </div>
            </div>
        </div>

        <p className="text-[10px] text-zinc-500 text-center px-4">
            Відправляйте лише <span className="text-white font-bold">USDT</span> у мережі <span className="text-white font-bold">TRC20</span>. Інші токени можуть бути втрачені назавжди.
        </p>

      </main>

      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-zinc-800 p-6">
        <div className="w-full max-w-md mx-auto">
          <button 
            onClick={handlePaid}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>💸</span>
            Я ОПЛАТИВ
          </button>
        </div>
      </div>

    </div>
  );
}
