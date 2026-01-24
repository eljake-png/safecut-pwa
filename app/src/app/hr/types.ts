export interface BarberProfile {
  id: string;
  fullName: string;
  nickname: string;
  bio: string;
  district: string;
  photoUrl: string | null;
  walletAddress: string; // USDT TRC20
  status: 'active' | 'fired' | 'inactive';
  joinDate: string;
}
