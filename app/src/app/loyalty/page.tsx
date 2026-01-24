'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// --- КОНФІГУРАЦІЯ WEB3 ---
const SFC_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; 
const SFC_ABI = [
  { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
  { "constant": false, "inputs": [], "name": "burnTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
];

export default function LoyaltyPage() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string>('0');

  const { data: balanceData } = useReadContract({
    address: SFC_CONTRACT_ADDRESS,
    abi: SFC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (balanceData) setBalance(balanceData.toString());
  }, [balanceData]);

  const handleBurn = async () => {
    try {
      writeContract({
        address: SFC_CONTRACT_ADDRESS,
        abi: SFC_ABI,
        functionName: 'burnTokens',
      });
      console.log('Burning tokens...');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 flex flex-col items-center">
      
      {/* Навігація назад */}
      <div className="w-full max-w-md mb-8">
        <Link href="/" className="flex items-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Назад до запису
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            SAFECUT CLUB
          </h1>
          <p className="text-zinc-500">
            Отримуй токени SFC за кожну стрижку та обмінюй їх на послуги.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                💎
              </div>
              <h3 className="font-bold text-lg">Підключіть гаманець</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Щоб перевірити баланс та використовувати токени.
              </p>
              <div className="flex justify-center">
                <ConnectWalletButton />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Ваш баланс</p>
                <div className="text-4xl font-black text-zinc-900 dark:text-white">
                  {balance} <span className="text-blue-600 text-lg">SFC</span>
                </div>
                <p className="text-[10px] font-mono text-zinc-400 mt-2 bg-zinc-100 dark:bg-zinc-800 py-1 px-2 rounded-lg inline-block">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleBurn}
                  disabled={Number(balance) < 10}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all
                    ${Number(balance) >= 10 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-blue-500/25 active:scale-95' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    }`}
                >
                  {Number(balance) >= 10 ? 'Оплатити стрижку (10 SFC)' : 'Недостатньо токенів (10 SFC)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}