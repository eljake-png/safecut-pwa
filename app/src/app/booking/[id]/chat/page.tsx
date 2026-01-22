'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', text: '🔒 Цей чат захищено наскрізним шифруванням.' },
    { id: 2, sender: 'system', text: '✅ Барбер Іван прийняв ваше замовлення.' },
  ]);

  const [inputText, setInputText] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // СЛУХАЧ ЗАВЕРШЕННЯ (якщо барбер завершить сесію, поки ми в чаті)
  useEffect(() => {
    const interval = setInterval(() => {
      const status = localStorage.getItem('order_status_SC-8821');
      if (status === 'completed') {
        router.push(`/booking/${id}/review`);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id, router]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'me', text: inputText }]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <Link href={`/booking/${id}/success`}>
          <button className="text-zinc-500 hover:text-black dark:hover:text-white">← Назад</button>
        </Link>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Барбер Іван</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Secure Tunnel</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                  {msg.text}
                </span>
              </div>
            );
          }
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-tl-sm border border-zinc-200 dark:border-zinc-700'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ваша адреса..."
            className="flex-1 bg-white dark:bg-black text-zinc-900 dark:text-white rounded-xl px-4 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
