'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Hourglass, MessageSquare, Lock } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId'); 
  const displayId = orderId || 'PROCESSING';

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      
      <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl relative">
        <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl"></div>
        <Hourglass size={40} className="text-yellow-600/80" />
      </div>

      <div className="mb-6">
        <span className="bg-yellow-950/30 text-yellow-600 border border-yellow-900/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Очікується адреса
        </span>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-wide mb-8">
        Замовлення прийнято
      </h1>

      <div className="w-full max-w-sm bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl mb-8 backdrop-blur-sm">
        <p className="text-zinc-300 text-sm font-medium mb-6 leading-relaxed">
          Напишіть свою адресу в <span className="text-blue-500 font-bold">зашифрованому чаті</span> прямо зараз!
        </p>
        <div className="h-px w-full bg-zinc-800 mb-4"></div>
        <div className="flex items-start gap-2 text-left">
          <Lock size={12} className="text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-zinc-600 leading-tight">
             Чат видаляється після завершення послуги.
          </p>
        </div>
      </div>

      <Link href={displayId !== 'PROCESSING' ? `/booking/${displayId}/chat` : '#'} className="w-full max-w-sm">
        <button disabled={displayId === 'PROCESSING'} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 disabled:opacity-50">
            <MessageSquare size={18} className="fill-white" />
            <span>НАПИСАТИ БАРБЕРУ</span>
        </button>
      </Link>
      
      <p className="mt-8 text-[10px] text-zinc-600 font-mono">
        ID: {displayId.slice(0, 8)}...
      </p>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}