'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gem, MapPin, ChevronRight, Loader2, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import DistrictSelector from '@/components/DistrictSelector';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Barber {
  id: string;
  fullName: string;
  nickname: string;
  bio: string;
  rating: number;
  status: string;
  avatarUrl?: string;
  district: string;
}

export default function Home() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'barbers'));
        const loadedBarbers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Barber[];
        setBarbers(loadedBarbers);
      } catch (error) {
        console.error("Error loading barbers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBarbers();
  }, []);

  return (
    <div className='flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='flex min-h-screen w-full max-w-md flex-col items-center py-12 px-6 bg-white dark:bg-black border-x border-zinc-100 dark:border-zinc-900 relative'>
        
        {/* Хедер */}
        <div className="w-full mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white uppercase">
            Safe<span className="text-blue-600">Cut</span>
          </h1>
          <p className="text-xs text-zinc-400 tracking-[0.2em] uppercase mt-2">Virtual Barbershop</p>
        </div>

        {/* Основний функціонал */}
        <div className="w-full flex-grow space-y-6">
          <DistrictSelector />
          
          <div className="flex items-center gap-2 mb-4 ml-1">
             <Zap size={14} className="text-blue-500 fill-blue-500" />
             <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
               Майстри поруч
             </h2>
          </div>

          {loading ? (
             <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-blue-600" />
             </div>
          ) : barbers.length === 0 ? (
             <div className="text-center text-zinc-500 py-10 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
               В цьому районі майстрів поки немає
             </div>
          ) : (
             <div className="space-y-4">
               {barbers.map((barber) => (
                 <div 
                   key={barber.id}
                   // ПЕРЕВІР, ЩОБ ПАПКА НАЗИВАЛАСЯ bookings (з 's')
                   onClick={() => router.push(`/booking/${barber.id}`)}
                   className="group relative bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer active:scale-[0.98] overflow-hidden hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                 >
                   {/* Neon Glow Background */}
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                   {/* Аватар + Статус */}
                   <div className="relative flex-shrink-0 z-10">
                     <div className="w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 group-hover:border-blue-500/50 transition-colors shadow-lg">
                       <img 
                         src={barber.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${barber.nickname}`} 
                         alt={barber.fullName}
                         className="w-full h-full object-cover"
                       />
                     </div>
                     <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-zinc-900 rounded-full ${
                       barber.status === 'active' || barber.status === 'online' 
                       ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' 
                       : 'bg-zinc-600'
                     }`}></div>
                   </div>
                   
                   {/* Інформація */}
                   <div className="flex-1 min-w-0 z-10">
                     <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-lg truncate pr-2 group-hover:text-blue-400 transition-colors">
                          {barber.fullName || barber.nickname}
                        </h3>
                     </div>
                     
                     <div className="flex items-center gap-2 mb-2">
                        {/* Рейтинг з неоновим ефектом */}
                        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500 shadow-inner">
                           <Star size={10} className="fill-yellow-500" /> 
                           <span>{barber.rating || '5.0'}</span>
                        </div>
                
                     </div>

                     <p className="text-[10px] text-zinc-500 line-clamp-1 group-hover:text-zinc-400 transition-colors">
                       {barber.bio || "Pro Barber • Haircut & Beard"}
                     </p>
                   </div>

                   {/* Стрілка */}
                   <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all z-10">
                      <ChevronRight size={16} className="text-zinc-500 group-hover:text-white" />
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Футер */}
        <div className="w-full mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-center">
          <Link 
            href="/loyalty" 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          >
            <div className="bg-white dark:bg-zinc-800 p-1.5 rounded-full shadow-sm group-hover:text-blue-600 transition-colors">
              <Gem size={14} />
            </div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 uppercase tracking-wide">
              Програма лояльності
            </span>
          </Link>
        </div>
        
      </main>
    </div>
  );
}