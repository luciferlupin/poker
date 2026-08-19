export type UserRole = 'MEMBER' | 'ADMIN';
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type MembershipTier = 'REGULAR' | 'GOLD_VIP' | 'PLATINUM' | 'DIAMOND';

export interface User {
  id: string;
  playerCode: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  kycStatus: KycStatus;
  membershipTier: MembershipTier;
  chipBalance: number;
  avatarUrl: string;
  createdAt: string;
}

export type GovIdType = 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'STATE_ID';

export interface KycRecord {
  id: string;
  userId: string;
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  govIdType: GovIdType;
  govIdNumber: string;
  idDocUrl: string;
  selfieUrl: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  referralSource: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
}

export type TransactionType =
  | 'CHIP_BUY_IN'
  | 'CHIP_CASH_OUT'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'GAME_WIN'
  | 'GAME_RAKE'
  | 'MEMBERSHIP_FEE';

export type PaymentMethod = 'BANK_WIRE' | 'CRYPTO' | 'CASH' | 'VIP_CREDIT' | 'SYSTEM';

export interface Transaction {
  id: string;
  txnCode: string;
  userId: string;
  userName: string;
  amount: number;
  type: TransactionType;
  method?: PaymentMethod;
  actionBy: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  notes?: string;
  createdAt: string;
}

export type GameType = 'TEXAS_HOLDEM' | 'OMAHA_PLO' | 'CASH_GAME' | 'TOURNAMENT';
export type TableStatus = 'OPEN' | 'RUNNING' | 'PAUSED' | 'CLOSED';

export interface SeatedPlayer {
  userId: string;
  name: string;
  avatar: string;
  stack: number;
  seatIndex: number;
}

export interface PokerTable {
  id: string;
  name: string;
  gameType: GameType;
  minBuyIn: number;
  maxBuyIn: number;
  smallBlind: number;
  bigBlind: number;
  maxSeats: number;
  occupiedSeats: number;
  status: TableStatus;
  seatedPlayers: SeatedPlayer[];
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: MembershipTier;
  priceMonthly: number;
  maxTableLimit: number;
  cashoutFeePercent: number;
  perks: string[];
  activeMembersCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: 'PUSH' | 'EMAIL' | 'WHATSAPP';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  targetId?: string;
  details: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalMembers: number;
  verifiedMembers: number;
  pendingKyc: number;
  activeTables: number;
  totalChipsCirculation: number;
  dailyTransactionsVolume: number;
  monthlyRevenue: number;
}
