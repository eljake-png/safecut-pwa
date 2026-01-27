'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSecureChat } from '@/hooks/useSecureChat';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function ClientChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // E2EE Logic
  const { 
    generateKeyPair, exportPublicKey, deriveSharedKey, 
    encryptMessage, decryptMessage, importPublicKey,
    exportKeyToJWK, importKeyFromJWK 
  } = useSecureChat();

  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [isSecure, setIsSecure] = useState(false);
  const hasInitialized = useRef(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [barberName, setBarberName] = useState('Барбер');

  // 1. ІНІЦІАЛІЗАЦІЯ КЛЮЧІВ (З ПАМ'ЯТТЮ)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      try {
        const storageKey = `safecut_key_${id}`;
        const storedKeys = localStorage.getItem(storageKey);

        let myPrivateKey: CryptoKey;
        let myPublicKey: CryptoKey;

        if (storedKeys) {
          // А. ВІДНОВЛЮЄМО СТАРІ КЛЮЧІ
          console.log("Restoring existing keys...");
          const parsed = JSON.parse(storedKeys);
          myPrivateKey = await importKeyFromJWK(parsed.privateKey, 'private');
          // Публічний нам тут для шифрування не треба, але для логіки хай буде
        } else {
          // Б. ГЕНЕРУЄМО НОВІ КЛЮЧІ
          console.log("Generating new keys...");
          const keyPair = await generateKeyPair();
          myPrivateKey = keyPair.privateKey;
          myPublicKey = keyPair.publicKey;

          // Зберігаємо приватний ключ в LocalStorage
          const jwkPrivate = await exportKeyToJWK(myPrivateKey);
          localStorage.setItem(storageKey, JSON.stringify({
             privateKey: jwkPrivate
          }));

          // Відправляємо публічний в Firebase
          const exportedPublicKey = await exportPublicKey(myPublicKey);
          await updateDoc(doc(db, 'bookings', id), {
            clientPublicKey: exportedPublicKey,
            clientOnline: true
          });
        }

        setPrivateKey(myPrivateKey);

      } catch (e) {
        console.error("Error init chat keys:", e);
      }
    };
    initChat();
  }, [id]);

  // 2. СЛУХАЄМО ЗАМОВЛЕННЯ (HANDSHAKE)
  useEffect(() => {
    if (!privateKey) return;

    const unsub = onSnapshot(doc(db, 'bookings', id), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.barberName) setBarberName(data.barberName);

        // Якщо є ключ барбера і ми ще не обчислили секрет
        if (data.barberPublicKey && !sharedKey) {
          try {
            const remoteKey = await importPublicKey(data.barberPublicKey);
            const secret = await deriveSharedKey(privateKey, remoteKey);
            setSharedKey(secret);
            setIsSecure(true);
            console.log("Secure Tunnel Established ✅");
          } catch (e) {
            console.error("Handshake failed:", e);
          }
        }

        if (data.status === 'completed') {
           // Очищаємо ключі при завершенні
           localStorage.removeItem(`safecut_key_${id}`);
           router.push(`/booking/${id}/review`);
        }
      }
    });
    return () => unsub();
  }, [id, privateKey, sharedKey]);

  // 3. СЛУХАЄМО ПОВІДОМЛЕННЯ
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
             console.warn("Decrypt fail (key mismatch or corrupt):", doc.id);
             text = '⚠️ Помилка ключа';
           }
        } else if (!sharedKey) {
            text = '🔒 Очікування ключів...';
        }

        return {
          id: doc.id,
          sender: data.senderId === 'client' ? 'me' : 'barber',
          text: text,
          isSystem: data.isSystem
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

  const handleSend = async () => {
    if (!inputText.trim() || !sharedKey) return;
    try {
        const encrypted = await encryptMessage(inputText, sharedKey);
        await addDoc(collection(db, 'bookings', id, 'messages'), {
          senderId: 'client',
          encryptedContent: encrypted,
          createdAt: serverTimestamp(),
          isSystem: false
        });
        setInputText('');
    } catch (e) {
        console.error("Send error:", e);
    }
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
            <span className="font-bold text-sm">{barberName}</span>
            <span className={`w-2 h-2 rounded-full ${isSecure ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            {isSecure ? 'Secure Tunnel Encrypted' : 'Establishing connection...'}
          </span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-center my-4">
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
               🔒 Цей чат захищено наскрізним шифруванням
            </span>
        </div>

        {messages.map((msg) => {
          if (msg.isSystem) {
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
            disabled={!isSecure} 
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isSecure ? "Ваша адреса..." : "З'єднання..."}
            className="flex-1 bg-white dark:bg-black text-zinc-900 dark:text-white rounded-xl px-4 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!isSecure}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}