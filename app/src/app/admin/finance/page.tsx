"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Додав роутер
import { 
  collection, query, where, getDocs, writeBatch, doc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, DollarSign, RefreshCw, CheckCircle, Users } from 'lucide-react'; // Додав Users

interface BarberFinanceState {
  barberId: string;
  barberName: string;
  cashCollected: number;    
  cryptoHeldByAdmin: number; 
  bonusValueOriginal: number; 
  commissionFromCash: number; 
  payoutFromCrypto: number;   
  compensationForBonus: number; 
  netBalance: number;
  unsettledOrderIds: string[];
}

export default function AdminFinancePage() {
  const router = useRouter(); // Ініціалізація роутера
  const [financials, setFinancials] = useState<BarberFinanceState[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const COMMISSION_RATE = 0.33;
  const BARBER_SHARE_RATE = 0.67;

  const calculateFinances = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('status', '==', 'completed')
      );

      const querySnapshot = await getDocs(q);
      const tempMap: Record<string, BarberFinanceState> = {};

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isSettled === true) return;
        
        const bId = data.barberId;
        const bName = data.barberName || 'Unknown';
        
        if (!tempMap[bId]) {
          tempMap[bId] = {
            barberId: bId,
            barberName: bName,
            cashCollected: 0,
            cryptoHeldByAdmin: 0,
            bonusValueOriginal: 0,
            commissionFromCash: 0,
            payoutFromCrypto: 0,
            compensationForBonus: 0,
            netBalance: 0,
            unsettledOrderIds: []
          };
        }

        const item = tempMap[bId];
        item.unsettledOrderIds.push(docSnap.id);

        if (data.isBonusCut) {
           const originalPrice = Number(data.totalPrice) || 0;
           item.bonusValueOriginal += originalPrice;
        } else {
           const price = Number(data.finalPrice ?? data.totalPrice);
           if (data.paymentMethod === 'crypto') {
             item.cryptoHeldByAdmin += price;
           } else {
             item.cashCollected += price;
           }
        }
      });

      const resultList = Object.values(tempMap).map(item => {
        item.commissionFromCash = item.cashCollected * COMMISSION_RATE;
        item.payoutFromCrypto = item.cryptoHeldByAdmin * BARBER_SHARE_RATE;
        item.compensationForBonus = item.bonusValueOriginal * BARBER_SHARE_RATE;
        item.netBalance = item.commissionFromCash - (item.payoutFromCrypto + item.compensationForBonus);
        return item;
      });

      setFinancials(resultList);
    } catch (e) {
      console.error("Error calculating finances:", e);
      alert("Помилка розрахунків.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateFinances();
  }, []);

  const handleSettle = async (barber: BarberFinanceState) => {
    const confirmMsg = barber.netBalance > 0 
      ? `Ви забрали у ${barber.barberName} готівку в сумі ${barber.netBalance.toFixed(0)} грн?`
      : `Ви виплатили ${barber.barberName} борг в сумі ${Math.abs(barber.netBalance).toFixed(0)}?`;

    if (!confirm(confirmMsg)) return;

    setProcessingId(barber.barberId);
    try {
      const batch = writeBatch(db);
      barber.unsettledOrderIds.forEach(orderId => {
        const ref = doc(db, 'bookings', orderId);
        batch.update(ref, { isSettled: true, settledAt: new Date() });
      });
      await batch.commit();
      await calculateFinances();
      alert("Баланс успішно обнулено!");
    } catch (e) {
      console.error("Error settling:", e);
      alert("Помилка при збереженні.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans pb-24"> {/* pb-24 для меню */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="text-green-500" /> Фінанси
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
             Віртуальний бухгалтер (Комісія: 33%)
          </p>
        </div>
        <button 
          onClick={calculateFinances}
          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition-colors"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      ) : financials.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-zinc-300">Всі рахунки закрито</h3>
            <p className="text-zinc-500">Боргів немає. Можна пити чай.</p>
        </div>
      ) : (
        <div className="grid gap-6">
           {financials.map(item => {
             const isPositive = item.netBalance >= 0;
             return (
               <div key={item.barberId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold">{item.barberName}</h2>
                        <span className="text-xs text-zinc-500 font-mono">{item.unsettledOrderIds.length} нових замовлень</span>
                    </div>
                    <div className={`text-right px-4 py-2 rounded-xl border ${
                        isPositive 
                          ? 'bg-green-900/20 border-green-500/30 text-green-400' 
                          : 'bg-red-900/20 border-red-500/30 text-red-400'
                    }`}>
                        <p className="text-[10px] uppercase font-bold tracking-wider mb-1">
                            {isPositive ? 'Барбер винен Платформі' : 'Платформа винна Барберу'}
                        </p>
                        <p className="text-3xl font-black font-mono">
                            {Math.abs(item.netBalance).toFixed(0)} <span className="text-sm">UAH</span>
                        </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 relative z-10 text-sm">
                      <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                          <p className="text-zinc-500 text-[10px] uppercase mb-1">Готівка</p>
                          <p className="text-white font-bold">{item.cashCollected} ₴</p>
                          <p className="text-red-400 text-xs mt-1">- {(item.commissionFromCash).toFixed(0)} ком.</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                          <p className="text-zinc-500 text-[10px] uppercase mb-1">Крипта</p>
                          <p className="text-blue-400 font-bold">{item.cryptoHeldByAdmin} T</p>
                          <p className="text-green-400 text-xs mt-1">+ {(item.payoutFromCrypto).toFixed(0)} вип.</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                           <p className="text-zinc-500 text-[10px] uppercase mb-1">Free</p>
                           <p className="text-purple-400 font-bold">{item.bonusValueOriginal} ₴</p>
                           <p className="text-green-400 text-xs mt-1">+ {(item.compensationForBonus).toFixed(0)} комп.</p>
                      </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 flex justify-end relative z-10">
                      <button
                        onClick={() => handleSettle(item)}
                        disabled={processingId === item.barberId}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
                            isPositive 
                             ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'
                             : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                        }`}
                      >
                         {processingId === item.barberId ? (
                            <Loader2 className="animate-spin" size={18}/>
                         ) : (
                            <CheckCircle size={18} />
                         )}
                         {isPositive ? 'ЗАКРИТИ РАХУНОК' : 'ЗАКРИТИ БОРГ'}
                      </button>
                  </div>
               </div>
             );
           })}
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-800 p-2 pb-6 flex justify-around items-center z-50">
        <button 
           onClick={() => router.push('/admin/hr')} 
          className="p-2 flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors w-20 active:scale-95"
        >
          <Users size={24} />
          <span className="text-[10px] font-medium">Персонал</span>
        </button>
        
        <button 
          // Активна вкладка (Фінанси)
          className="p-2 flex flex-col items-center gap-1 text-white w-20 transition-transform active:scale-95"
        >
          <DollarSign size={24} className="text-green-500" />
          <span className="text-[10px] font-bold text-green-500">Фінанси</span>
        </button>
      </div>

    </div>
  );
}