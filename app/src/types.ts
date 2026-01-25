// src/types.ts
export interface BarberProfile {
  id: string;
  fullName: string;
  nickname: string;
  district: string;
  bio: string;
  photoUrl: string | null;
  walletAddress?: string;
  status: 'active' | 'offline' | 'fired';
  joinDate: any; // Timestamp з Firebase
}