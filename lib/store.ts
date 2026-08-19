import {
  User,
  KycRecord,
  Transaction,
  PokerTable,
  MembershipPlan,
  NotificationItem,
  AuditLog,
  AnalyticsSummary,
  KycStatus,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_KYC_RECORDS,
  INITIAL_TRANSACTIONS,
  INITIAL_POKER_TABLES,
  INITIAL_MEMBERSHIPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './mockData';

const STORAGE_KEY = 'poker_club_data_v1';

interface AppStorageData {
  users: User[];
  kycRecords: KycRecord[];
  transactions: Transaction[];
  tables: PokerTable[];
  memberships: MembershipPlan[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

// Get raw state from localStorage or initialize with seed data
export function getStoreData(): AppStorageData {
  if (typeof window === 'undefined') {
    return {
      users: INITIAL_USERS,
      kycRecords: INITIAL_KYC_RECORDS,
      transactions: INITIAL_TRANSACTIONS,
      tables: INITIAL_POKER_TABLES,
      memberships: INITIAL_MEMBERSHIPS,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: AppStorageData = {
        users: INITIAL_USERS,
        kycRecords: INITIAL_KYC_RECORDS,
        transactions: INITIAL_TRANSACTIONS,
        tables: INITIAL_POKER_TABLES,
        memberships: INITIAL_MEMBERSHIPS,
        notifications: INITIAL_NOTIFICATIONS,
        auditLogs: INITIAL_AUDIT_LOGS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse store data, resetting to initial state', e);
    return {
      users: INITIAL_USERS,
      kycRecords: INITIAL_KYC_RECORDS,
      transactions: INITIAL_TRANSACTIONS,
      tables: INITIAL_POKER_TABLES,
      memberships: INITIAL_MEMBERSHIPS,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
  }
}

export function saveStoreData(data: AppStorageData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Utility API methods for mutations

export function approveOrRejectKyc(
  kycId: string,
  newStatus: 'VERIFIED' | 'REJECTED' | 'SUSPENDED',
  notes: string,
  reviewerName: string
) {
  const store = getStoreData();
  const kycIndex = store.kycRecords.findIndex((k) => k.id === kycId);
  if (kycIndex === -1) return store;

  const kyc = store.kycRecords[kycIndex];
  kyc.status = newStatus;
  kyc.notes = notes;
  kyc.reviewedAt = new Date().toISOString();
  kyc.reviewedBy = reviewerName;

  // Update corresponding user's kycStatus
  const userIndex = store.users.findIndex((u) => u.id === kyc.userId);
  if (userIndex !== -1) {
    store.users[userIndex].kycStatus = newStatus as KycStatus;
  }

  // Create Notification
  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: kyc.userId,
    title: `KYC Status Updated: ${newStatus}`,
    message: `Your identity verification request has been ${newStatus.toLowerCase()} by ${reviewerName}. Notes: ${notes || 'No additional notes.'}`,
    channel: 'PUSH',
    read: false,
    createdAt: new Date().toISOString(),
  };
  store.notifications.unshift(notif);

  // Create Audit Log
  const log: AuditLog = {
    id: `log_${Date.now()}`,
    action: `KYC_${newStatus}`,
    actorId: 'usr_admin',
    actorName: reviewerName,
    targetId: kyc.userId,
    details: `Set KYC status for ${kyc.fullName} (${kyc.userId}) to ${newStatus}. Notes: ${notes}`,
    createdAt: new Date().toISOString(),
  };
  store.auditLogs.unshift(log);

  saveStoreData(store);
  return store;
}

export function adjustUserChips(
  userId: string,
  amount: number,
  isCredit: boolean,
  notes: string,
  adminName: string
) {
  const store = getStoreData();
  const userIndex = store.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return store;

  const user = store.users[userIndex];
  const delta = isCredit ? amount : -amount;
  user.chipBalance = Math.max(0, user.chipBalance + delta);

  const txnCode = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
  const txn: Transaction = {
    id: `txn_${Date.now()}`,
    txnCode,
    userId: user.id,
    userName: user.name,
    amount: amount,
    type: isCredit ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
    method: 'SYSTEM',
    actionBy: adminName,
    status: 'COMPLETED',
    notes: notes || (isCredit ? 'Admin Chip Credit' : 'Admin Chip Deduction'),
    createdAt: new Date().toISOString(),
  };
  store.transactions.unshift(txn);

  // Notification
  store.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: user.id,
    title: isCredit ? 'Chips Added to Wallet' : 'Chips Deducted',
    message: `${adminName} has ${isCredit ? 'credited' : 'deducted'} ${amount.toLocaleString()} chips. Balance: ${user.chipBalance.toLocaleString()} chips.`,
    channel: 'PUSH',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // Audit Log
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: isCredit ? 'CHIP_CREDIT' : 'CHIP_DEBIT',
    actorId: 'usr_admin',
    actorName: adminName,
    targetId: user.id,
    details: `${isCredit ? 'Credited' : 'Deducted'} ${amount.toLocaleString()} chips for ${user.name}. Notes: ${notes}`,
    createdAt: new Date().toISOString(),
  });

  saveStoreData(store);
  return store;
}

export function requestChipBuyInOrCashOut(
  userId: string,
  amount: number,
  type: 'CHIP_BUY_IN' | 'CHIP_CASH_OUT',
  method: 'BANK_WIRE' | 'CRYPTO' | 'CASH' | 'VIP_CREDIT',
  userName: string
) {
  const store = getStoreData();
  const txnCode = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;

  const txn: Transaction = {
    id: `txn_${Date.now()}`,
    txnCode,
    userId,
    userName,
    amount,
    type,
    method,
    actionBy: userName,
    status: 'PENDING',
    notes: `User requested ${type === 'CHIP_BUY_IN' ? 'Buy-in' : 'Cash-out'} via ${method}`,
    createdAt: new Date().toISOString(),
  };

  store.transactions.unshift(txn);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: type,
    actorId: userId,
    actorName: userName,
    targetId: txn.id,
    details: `User requested ${type} of ${amount.toLocaleString()} chips via ${method}`,
    createdAt: new Date().toISOString(),
  });

  saveStoreData(store);
  return store;
}

export function createNewPokerTable(
  tableData: Omit<PokerTable, 'id' | 'seatedPlayers' | 'createdAt' | 'occupiedSeats'>,
  adminName: string
) {
  const store = getStoreData();
  const newTable: PokerTable = {
    ...tableData,
    id: `tbl_${Date.now()}`,
    occupiedSeats: 0,
    seatedPlayers: [],
    createdAt: new Date().toISOString(),
  };

  store.tables.unshift(newTable);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'TABLE_CREATED',
    actorId: 'usr_admin',
    actorName: adminName,
    targetId: newTable.id,
    details: `Created table ${newTable.name} (${newTable.gameType}) with min buy-in ${newTable.minBuyIn}`,
    createdAt: new Date().toISOString(),
  });

  saveStoreData(store);
  return store;
}

export function computeAnalytics(store: AppStorageData): AnalyticsSummary {
  const totalMembers = store.users.length;
  const verifiedMembers = store.users.filter((u) => u.kycStatus === 'VERIFIED').length;
  const pendingKyc = store.users.filter((u) => u.kycStatus === 'PENDING').length;
  const activeTables = store.tables.filter((t) => t.status === 'RUNNING' || t.status === 'OPEN').length;
  const totalChipsCirculation = store.users.reduce((acc, u) => acc + u.chipBalance, 0);

  const dailyTransactionsVolume = store.transactions.reduce((acc, t) => acc + t.amount, 0);
  const monthlyRevenue = store.memberships.reduce((acc, m) => acc + m.priceMonthly * m.activeMembersCount, 0);

  return {
    totalMembers,
    verifiedMembers,
    pendingKyc,
    activeTables,
    totalChipsCirculation,
    dailyTransactionsVolume,
    monthlyRevenue,
  };
}
