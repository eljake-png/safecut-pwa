import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  block: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
}

interface ApiResponse {
  data: Transaction[];
  meta: {
    page_size: number;
  };
}

export const useCryptoPaymentVerifier = (walletAddress: string, expectedAmount: number) => {
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'confirmed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    const startTime = Date.now();
    
    const checkPaymentStatus = async () => {
      // --- DEMO MODE START ---
      // Якщо це демо-гаманець, симулюємо успіх через 3 секунди
      if (walletAddress.includes('demo')) {
        console.log("DEV MODE: Симуляція пошуку транзакції...");
        setStatus('searching');
        
        setTimeout(() => {
            console.log("DEV MODE: Транзакцію знайдено!");
            setStatus('found');
            
            setTimeout(() => {
                console.log("DEV MODE: Підтверджено!");
                setStatus('confirmed');
            }, 2000); // Час на "підтвердження"
            
        }, 3000); // Час на "пошук"
        
        return; 
      }
      // --- DEMO MODE END ---

      if (Date.now() - startTime > 10 * 60 * 1000) {
         setStatus('error');
         setError('timeout');
         if (pollingInterval) clearInterval(pollingInterval);
         return;
      }

      setStatus((prev) => (prev === 'idle' ? 'searching' : prev));

      try {
        const expectedValue = (expectedAmount * 1_000_000).toString();
        
        const response = await fetch(
          `https://api.trongrid.io/v1/accounts/${walletAddress}/transactions/trc20?only_to=true&limit=20`
        );

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const json: ApiResponse = await response.json();
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        
        const foundTx = json.data.find(tx => {
           const txTime = tx.timestamp; 
           return tx.value === expectedValue && txTime > tenMinutesAgo;
        });

        if (foundTx) {
          setStatus('found');
          if (pollingInterval) clearInterval(pollingInterval);
          
          setTimeout(() => {
             setStatus('confirmed');
          }, 2000);
        }

      } catch (err: any) {
        console.error("Payment check error:", err);
      }
    };

    if (walletAddress.includes('demo')) {
        checkPaymentStatus();
    } else {
        pollingInterval = setInterval(checkPaymentStatus, 5000);
        checkPaymentStatus();
    }

    return () => {
        if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [walletAddress, expectedAmount]);

  return { status, error };
};
