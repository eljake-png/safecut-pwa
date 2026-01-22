'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BarberChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', text: '🔒 Цей чат захищено наскрізним шифруванням.' },
    { id: 2, sender: 'system', text: '✅ Ви прийняли замовлення. Клієнт отримав сповіщення.' },
  ]);

  const [inputText, setInputText] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: 3, sender: 'client', text: 'Привіт! Супер. Я на Північному, вул. Шухевича 12, 3 підʼїзд.' }
      ]);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'me', text: inputText }]);
    setInputText('');
  };

  const handleStartSession = () => {
    // Перехід на екран сесії (таймер + SOS)
    router.push('/barber/session/SC-8821');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <Link href="/barber/dashboard">
          <button className="text-zinc-400 hover:text-white">← Назад</button>
        </Link>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">@alex_blade</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Encrypted Connection</span>
        </div>

        {/* Кнопка ПОЧАТИ */}
        <button 
            onClick={handleStartSession}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-blue-900/20 transition-colors flex items-center gap-1"
        >
          ✂️ Почати
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-[10px] bg-zinc-900 text-zinc-500 px-3 py-1 rounded-full border border-zinc-800">
                  {msg.text}
                </span>
              </div>
            );
          }
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 pb-8">
        <div className="flex gap-3">
          <button className="p-3 text-zinc-400 hover:text-white transition-colors">
             📎
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишіть повідомлення..."
            className="flex-1 bg-zinc-950 text-white rounded-xl px-4 border border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-zinc-600"
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
