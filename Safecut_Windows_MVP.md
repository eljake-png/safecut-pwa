```tsx
// src/app/page.tsx

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import ConnectWalletButton from '@/components/ConnectWalletButton'; // Assuming you have this component created
import { useState, useEffect } from 'react';

const SFC_CONTRACT_ADDRESS = '0x...'; // Replace with the actual contract address
const SFC_ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "burnTokens",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; // Replace with the actual ABI

const Page = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string>('0');

  const readContract = useReadContract({
    addressOrName: SFC_CONTRACT_ADDRESS,
    contractInterface: SFC_ABI,
  });

  const writeContract = useWriteContract({
    addressOrName: SFC_CONTRACT_ADDRESS,
    contractInterface: SFC_ABI,
    functionName: 'burnTokens',
  });

  useEffect(() => {
    if (isConnected && address) {
      readContract.balanceOf(address).then((result) => {
        setBalance(result.toString());
      });
    }
  }, [isConnected, address, readContract]);

  const handleBurn = async () => {
    try {
      const tx = await writeContract();
      console.log('Transaction sent:', tx);
      // Optionally wait for the transaction to be mined
      // await tx.wait();
      // Update balance after successful burn
      setBalance((prev) => (parseInt(prev) - 10).toString());
    } catch (error) {
      console.error('Error burning tokens:', error);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Safecut Network</h1>
      {!isConnected ? (
        <ConnectWalletButton />
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p>Address: {address}</p>
          <p>Balance: {balance} SFC</p>
          <button
            onClick={handleBurn}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Спалити 10 SFC (Стрижка)
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
```

This code sets up a Next.js page with Tailwind CSS for styling and Wagmi hooks for Web3 functionality. It includes:
- A dark-themed UI with a stylish header.
- A `ConnectWalletButton` component to connect the user's wallet.
- Display of the connected wallet address and SFC token balance.
- A button to burn 10 SFC tokens, which updates the balance upon successful transaction.

Make sure you have the `ConnectWalletButton` component created in your project at the specified path (`@/components/ConnectWalletButton`). Adjust the contract address and ABI as needed.