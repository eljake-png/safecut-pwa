import React from 'react';
import { BarberProfile } from '../../types'; // Виправлений імпорт

interface BarberListProps {
  barbers: BarberProfile[];
}

const BarberList: React.FC<BarberListProps> = ({ barbers }) => {
  return (
    <div className="space-y-4 pb-24">
      {barbers.map(barber => (
        <div key={barber.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
          {/* Avatar Placeholder or Image */}
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0">
             {barber.photoUrl ? (
                <img src={barber.photoUrl} alt={barber.fullName} className="w-full h-full object-cover" />
             ) : (
                <span className="text-xl font-bold text-zinc-500">{barber.nickname.substring(0,2).toUpperCase()}</span>
             )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold text-white truncate">{barber.fullName}</h2>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    barber.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                    {barber.status}
                </div>
            </div>
            <p className="text-sm text-blue-400 font-mono mb-1">@{barber.nickname}</p>
            <p className="text-xs text-zinc-500 truncate">{barber.bio}</p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                    📍 {barber.district}
                </span>
                <span className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                    TRC20
                </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarberList;
