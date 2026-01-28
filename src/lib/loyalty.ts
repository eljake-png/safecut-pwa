import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
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
  // УВАГА: Тут має бути doc(db, ...), а не db.collection(...)
  const clientRef = doc(db, 'clients', clientId);
  const docSnap = await getDoc(clientRef);

  if (!docSnap.exists()) {
    // Ініціалізація, якщо клієнта ще немає
    return {
        haircutsCount: 0,
        bonuses: 0,
        lastHaircutDate: new Date(),
        rewards: []
    };
  }

  const data = docSnap.data();
  // Повертаємо існуючі дані або дефолтні
  return data.loyalty || {
    haircutsCount: 0,
    bonuses: 0,
    lastHaircutDate: new Date(),
    rewards: []
  };
}

export async function initializeLoyalty(clientId: string): Promise<void> {
  const clientRef = doc(db, 'clients', clientId);
  await setDoc(clientRef, {
    loyalty: {
      haircutsCount: 0,
      bonuses: 0,
      lastHaircutDate: new Date(),
      rewards: []
    }
  }, { merge: true });
}

export async function incrementHaircutCount(clientId: string): Promise<void> {
  const clientRef = doc(db, 'clients', clientId);
  
  // Атомарний інкремент
  await updateDoc(clientRef, {
    'loyalty.haircutsCount': increment(1),
    'loyalty.lastHaircutDate': new Date()
  });
}