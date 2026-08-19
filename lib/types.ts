export type UserRole = 'MEMBER' | 'ADMIN' | 'STAFF';

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type GovIdType = 'AADHAAR' | 'PAN_CARD' | 'DRIVING_LICENSE' | 'PASSPORT' | 'VOTER_ID' | 'STATE_ID' | 'NATIONAL_ID';

export type MembershipTier = 'ROYAL_VIP' | 'PLATINUM_HIGH_ROLLER' | 'GOLD_CLUB' | 'SILVER';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  playerCode: string;
  role: UserRole;
  membershipTier: MembershipTier;
  kycStatus: KycStatus;
  chipBalance: number;
  avatarUrl: string;
  joinedDate: string;
  createdAt?: string;
}

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
  referralSource?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: KycStatus;
  notes?: string;
}

export type TxnType = 'CHIP_BUY_IN' | 'CHIP_CASH_OUT' | 'TABLE_WIN' | 'TABLE_LOSS' | 'ADMIN_CREDIT' | 'ADMIN_DEDUCT' | 'ADMIN_DEBIT';

export type SettlementMethod = 'UPI' | 'IMPS_BANK_TRANSFER' | 'BANK_WIRE' | 'CRYPTO' | 'CASH' | 'VIP_CREDIT' | 'SYSTEM';

export interface Transaction {
  id: string;
  txnCode: string;
  userId: string;
  userName: string;
  type: TxnType;
  amount: number;
  method?: SettlementMethod;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  actionBy: string;
  createdAt: string;
  notes?: string;
}

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
  gameType: 'TEXAS_HOLDEM' | 'OMAHA_PLO' | 'TOURNAMENT' | 'VIP_PRIVATE';
  minBuyIn: number;
  maxBuyIn: number;
  smallBlind: number;
  bigBlind: number;
  maxSeats: number;
  occupiedSeats: number;
  seatedPlayers: SeatedPlayer[];
  status: 'OPEN' | 'RUNNING' | 'CLOSED';
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  tier: MembershipTier;
  name: string;
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
  totalChipsCirculation: number;
  monthlyRevenue: number;
  activeTables?: number;
  dailyTransactionsVolume?: number;
}
