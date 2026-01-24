'use client'

import React, { useState } from 'react';

const districts = [
  { id: 1, name: 'Північний', active: true },
  { id: 2, name: 'Ювілейний', active: false },
  { id: 3, name: 'Щасливе', active: false },
];

export default function DistrictSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(districts[0]);

  return (
    <div className="relative w-full max-w-md mb-8 z-50">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Твій район:</span>
      </div>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-blue-500 transition-colors"
      >
        <span className="font-bold text-lg text-zinc-900 dark:text-white">
          📍 {selected.name}
        </span>
        <span className="text-zinc-400">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {districts.map((district) => (
            <button
              key={district.id}
              disabled={!district.active}
              onClick={() => {
                if (district.active) {
                  setSelected(district);
                  setIsOpen(false);
                }
              }}
              className={`w-full text-left p-4 flex items-center justify-between border-b last:border-0 border-zinc-100 dark:border-zinc-800 transition-colors
                ${district.active 
                  ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-950'}`}
            >
              <span className={district.active ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}>
                {district.name}
              </span>
              {!district.active && <span className="text-xs text-zinc-400">(Скоро)</span>}
              {selected.id === district.id && <span className="text-blue-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
