'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet } from 'lucide-react';

export function ConnectWalletButton() {
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    // Беремо перший доступний конектор (зазвичай MetaMask або Injected)
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg text-sm font-bold transition-all"
      >
        <Wallet size={16} />
        Відключити
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
    >
      <Wallet size={18} />
      Підключити гаманець
    </button>
  );
}