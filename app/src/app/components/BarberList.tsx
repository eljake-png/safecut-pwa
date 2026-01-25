import React from 'react';
import { BarberProfile } from '@/types';
import { MapPin, Calendar, Wallet } from 'lucide-react';

interface BarberListProps {
  barbers: BarberProfile[];
}

export default function BarberList({ barbers }: BarberListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {barbers.map((barber) => (
        <div 
          key={barber.id} 
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-blue-600/50 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {/* Аватарка */}
              <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                {barber.photoUrl ? (
                  <img src={barber.photoUrl} alt={barber.nickname} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-lg">
                    {barber.nickname.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Інфо */}
              <div>
                <h3 className="font-bold text-lg leading-none text-white group-hover:text-blue-500 transition-colors">
                  {barber.nickname}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{barber.fullName}</p>
              </div>
            </div>

            {/* Статус */}
            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
              barber.status === 'active' ? 'bg-green-500/10 text-green-500' : 
              barber.status === 'fired' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-500/10 text-zinc-500'
            }`}>
              {barber.status}
            </span>
          </div>

          <div className="space-y-2 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{barber.district}</span>
            </div>
            {barber.walletAddress && (
              <div className="flex items-center gap-2 font-mono text-xs">
                <Wallet size={14} />
                <span>{barber.walletAddress.slice(0,6)}...{barber.walletAddress.slice(-4)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-zinc-600">
              <Calendar size={14} />
              <span className="text-xs">Joined: {new Date(barber.joinDate?.seconds * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}