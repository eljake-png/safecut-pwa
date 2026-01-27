"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSecureChat } from '@/hooks/useSecureChat';
import { db } from '@/lib/firebase';
// Додаємо getDoc для отримання даних клієнта
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function BarberChatPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // E2EE
  const { 
    generateKeyPair, exportPublicKey, deriveSharedKey, 
    encryptMessage, decryptMessage, importPublicKey 
  } = useSecureChat();

  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [isSecure, setIsSecure] = useState(false);
  const hasInitialized = useRef(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Стан для нікнейму
  const [clientNickname, setClientNickname] = useState('...');

  // 1. INIT KEYS
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      const keyPair = await generateKeyPair();
      setPrivateKey(keyPair.privateKey);
      
      const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
      
      await updateDoc(doc(db, 'bookings', id), {
        barberPublicKey: exportedPublicKey,
        status: 'confirmed' 
      });
    };
    initChat();
  }, [id]);

  // 2. LISTEN FOR CLIENT KEY & FETCH CLIENT INFO
  useEffect(() => {
    if (!privateKey) return;
    
    const unsub = onSnapshot(doc(db, 'bookings', id), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // --- ВИПРАВЛЕНА ЛОГІКА ОТРИМАННЯ НІКНЕЙМУ ---
        // 1. Спробуємо взяти збережений нікнейм
        if (data.clientNickname) {
           setClientNickname(data.clientNickname);
        } 
        // 2. Якщо його немає, але є ID клієнта - тягнемо з бази clients
        else if (data.clientId) {
           try {
             const clientSnap = await getDoc(doc(db, 'clients', data.clientId));
             if (clientSnap.exists()) {
                const clientData = clientSnap.data();
                setClientNickname(clientData.nickname || clientData.fullName || 'Клієнт');
             } else {
                // Якщо не знайшли профіль, показуємо хоча б ID
                setClientNickname(data.clientId === 'temp_user_id' ? 'Гість' : data.clientId);
             }
           } catch (e) {
             console.error("Error fetching client details:", e);
           }
        }
        // ---------------------------------------------

        if (data.clientPublicKey && !sharedKey) {
          const remoteKey = await importPublicKey(data.clientPublicKey);
          const secret = await deriveSharedKey(privateKey, remoteKey);
          setSharedKey(secret);
          setIsSecure(true);
        }
      }
    });
    return () => unsub();
  }, [id, privateKey, sharedKey]);

  // 3. LISTEN MESSAGES
  useEffect(() => {
    const q = query(collection(db, 'bookings', id, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, async (snapshot) => {
      const loadedMessages = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let text = '🔒 ...';
        
        if (sharedKey && data.encryptedContent) {
           try {
             text = await decryptMessage(data.encryptedContent, sharedKey);
           } catch (e) {
             text = '⚠️ Помилка ключа';
           }
        }

        return {
          id: doc.id,
          sender: data.senderId === 'barber' ? 'me' : 'client',
          text: text
        };
      }));
      setMessages(loadedMessages);
      scrollToBottom();
    });
    return () => unsub();
  }, [id, sharedKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !sharedKey) return;
    const encrypted = await encryptMessage(inputText, sharedKey);
    await addDoc(collection(db, 'bookings', id, 'messages'), {
      senderId: 'barber',
      encryptedContent: encrypted,
      createdAt: serverTimestamp(),
      isSystem: false
    });
    setInputText('');
  };

  const handleStartSession = () => {
     router.push(`/barber/session/${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-4 py-3 flex items-center gap-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20">
        <button 
          onClick={() => router.push('/barber/dashboard')}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="flex items-center gap-3 flex-1">
           <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-sm border border-zinc-700 text-zinc-400 overflow-hidden">
             {/* Показуємо першу літеру або '?' */}
             {clientNickname !== '...' ? clientNickname.charAt(0).toUpperCase() : '?'}
           </div>
           <div>
             <h2 className="font-bold text-sm">@{clientNickname}</h2>
             <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isSecure ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">
                    {isSecure ? 'SECURE CONNECTION' : 'WAITING FOR KEYS...'}
                </p>
             </div>
           </div>
        </div>
      </header>

      {/* ACTION BAR */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 py-2 px-4 sticky top-[65px] z-10 flex justify-center">
        <button 
            onClick={handleStartSession}
            className="w-full max-w-sm bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 transition-all active:scale-95"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ПОЧАТИ СТРИЖКУ
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        <div className="flex justify-center my-4 opacity-50">
            <span className="text-[10px] text-zinc-500 px-3 py-1 border border-zinc-800 rounded-full">
               🔒 End-to-End Encrypted Tunnel
            </span>
        </div>

        {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === 'me' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700'
                }`}>
                    {msg.text}
                </div>
             </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 safe-area-bottom">
         <div className="flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!isSecure}
              placeholder={isSecure ? "Напишіть повідомлення..." : "З'єднання..."}
              className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600 disabled:opacity-50"
            />
            <button 
                onClick={handleSend}
                disabled={!isSecure}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white p-3 rounded-xl transition-colors active:scale-95"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
         </div>
      </div>
    </div>
  );
}