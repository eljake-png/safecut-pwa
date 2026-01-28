import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, // Використовуємо setDoc замість updateDoc
  increment 
} from 'firebase/firestore';

export interface Reward {
  id: string;
  name: string;
  description: string;
  isRedeemed: boolean;
}

export interface Loyalty {
  haircutsCount: number;
  bonuses: number;
  lastHaircutDate: any; 
  rewards: Reward[];
}

export async function getLoyaltyData(clientId: string): Promise<Loyalty> {
  const clientRef = doc(db, 'clients', clientId);
  const docSnap = await getDoc(clientRef);

  if (!docSnap.exists()) {
    return {
        haircutsCount: 0,
        bonuses: 0,
        lastHaircutDate: new Date(),
        rewards: []
    };
  }

  const data = docSnap.data();
  return data.loyalty || {
    haircutsCount: 0,
    bonuses: 0,
    lastHaircutDate: new Date(),
    rewards: []
  };
}

// Функція тепер безпечна: вона не впаде, навіть якщо ID неправильний
export async function incrementHaircutCount(clientId: string): Promise<void> {
  const clientRef = doc(db, 'clients', clientId);
  
  // setDoc з { merge: true } працює як "Upsert" (Update or Insert)
  await setDoc(clientRef, {
    loyalty: {
      haircutsCount: increment(1),
      lastHaircutDate: new Date()
    }
  }, { merge: true });
}