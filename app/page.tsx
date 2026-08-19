'use client';

import React, { useState, useEffect } from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { MemberPortal } from '@/components/MemberPortal';
import { AdminDashboard } from '@/components/AdminDashboard';
import {
  getStoreData,
  approveOrRejectKyc,
  adjustUserChips,
  requestChipBuyInOrCashOut,
  createNewPokerTable,
  computeAnalytics,
  saveStoreData,
} from '@/lib/store';
import { User, KycRecord, NotificationItem, AuditLog } from '@/lib/types';
import { Shield, Sparkles, Crown } from 'lucide-react';

export default function Home() {
  const [store, setStore] = useState(getStoreData());
  const [currentRole, setCurrentRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Active user selection
  const [currentUser, setCurrentUser] = useState<User>(
    store.users.find((u) => u.id === 'usr_2') || store.users[0]
  );

  // Sync state on load
  useEffect(() => {
    const loaded = getStoreData();
    setStore(loaded);
    const defaultMember = loaded.users.find((u) => u.id === 'usr_2') || loaded.users[0];
    setCurrentUser(defaultMember);
  }, []);

  const refreshStore = () => {
    const updated = getStoreData();
    setStore(updated);
    const match = updated.users.find((u) => u.id === currentUser.id);
    if (match) setCurrentUser(match);
  };

  const handleToggleRole = (role: 'MEMBER' | 'ADMIN') => {
    setCurrentRole(role);
    if (role === 'ADMIN') {
      const adminUser = store.users.find((u) => u.role === 'ADMIN') || store.users[0];
      setCurrentUser(adminUser);
    } else {
      const memberUser = store.users.find((u) => u.id === 'usr_2') || store.users[0];
      setCurrentUser(memberUser);
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setCurrentRole('ADMIN');
    } else {
      setCurrentRole('MEMBER');
    }
  };

  // 1. Submit KYC
  const handleSubmitKyc = (formData: Partial<KycRecord>) => {
    const existingIndex = store.kycRecords.findIndex((k) => k.userId === currentUser.id);
    const newKyc: KycRecord = {
      id: existingIndex !== -1 ? store.kycRecords[existingIndex].id : `kyc_${Date.now()}`,
      userId: currentUser.id,
      fullName: formData.fullName || currentUser.name,
      dob: formData.dob || '1990-01-01',
      gender: formData.gender || 'MALE',
      phone: formData.phone || currentUser.phone,
      email: formData.email || currentUser.email,
      address: formData.address || '123 Mayfair St',
      city: formData.city || 'London',
      state: formData.state || 'Greater London',
      country: formData.country || 'United Kingdom',
      govIdType: formData.govIdType || 'PASSPORT',
      govIdNumber: formData.govIdNumber || 'P900011',
      idDocUrl: formData.idDocUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
      selfieUrl: formData.selfieUrl || currentUser.avatarUrl,
      emergencyContactName: formData.emergencyContactName || 'Emergency Contact',
      emergencyContactPhone: formData.emergencyContactPhone || '+1 555 000 1111',
      referralSource: formData.referralSource || 'Direct Registration',
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    if (existingIndex !== -1) {
      store.kycRecords[existingIndex] = newKyc;
    } else {
      store.kycRecords.unshift(newKyc);
    }

    // Update user kyc status
    const uIdx = store.users.findIndex((u) => u.id === currentUser.id);
    if (uIdx !== -1) {
      store.users[uIdx].kycStatus = 'PENDING';
    }

    // Add Audit Log
    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'KYC_SUBMITTED',
      actorId: currentUser.id,
      actorName: currentUser.name,
      targetId: newKyc.id,
      details: `User ${currentUser.name} (${currentUser.playerCode}) submitted KYC verification details`,
      createdAt: new Date().toISOString(),
    });

    saveStoreData(store);
    refreshStore();
  };

  // 2. Admin Review KYC
  const handleReviewKyc = (
    kycId: string,
    status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED',
    notes: string
  ) => {
    approveOrRejectKyc(kycId, status, notes, currentUser.name);
    refreshStore();
  };

  // 3. Admin Adjust Chips
  const handleAdjustChips = (
    userId: string,
    amount: number,
    isCredit: boolean,
    notes: string
  ) => {
    adjustUserChips(userId, amount, isCredit, notes, currentUser.name);
    refreshStore();
  };

  // 4. Member Request Buy-In / Cash-Out
  const handleRequestChips = (
    amount: number,
    type: 'CHIP_BUY_IN' | 'CHIP_CASH_OUT',
    method: 'BANK_WIRE' | 'CRYPTO' | 'CASH' | 'VIP_CREDIT'
  ) => {
    requestChipBuyInOrCashOut(currentUser.id, amount, type, method, currentUser.name);
    refreshStore();
  };

  // 5. Admin Create Table
  const handleCreateTable = (tableData: any) => {
    createNewPokerTable(tableData, currentUser.name);
    refreshStore();
  };

  // 6. Member Join Table
  const handleJoinTable = (tableId: string) => {
    const tableIndex = store.tables.findIndex((t) => t.id === tableId);
    if (tableIndex === -1) return;

    const table = store.tables[tableIndex];
    if (table.seatedPlayers.some((p) => p.userId === currentUser.id)) {
      alert(`You are already seated at table "${table.name}"!`);
      return;
    }

    if (table.seatedPlayers.length >= table.maxSeats) {
      alert(`Table "${table.name}" is currently full!`);
      return;
    }

    table.seatedPlayers.push({
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatarUrl,
      stack: Math.min(table.maxBuyIn, currentUser.chipBalance),
      seatIndex: table.seatedPlayers.length + 1,
    });
    table.occupiedSeats = table.seatedPlayers.length;
    if (table.status === 'OPEN') table.status = 'RUNNING';

    saveStoreData(store);
    refreshStore();
    alert(`Successfully taken a seat at "${table.name}" with $${Math.min(table.maxBuyIn, currentUser.chipBalance).toLocaleString()} chip stack!`);
  };

  // 7. Admin Broadcast Notification
  const handleBroadcastNotif = (
    title: string,
    message: string,
    channel: 'PUSH' | 'EMAIL' | 'WHATSAPP'
  ) => {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: 'usr_all',
      title,
      message,
      channel,
      read: false,
      createdAt: new Date().toISOString(),
    };
    store.notifications.unshift(notif);

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'BROADCAST_SENT',
      actorId: currentUser.id,
      actorName: currentUser.name,
      details: `Dispatched system announcement "${title}" via ${channel}`,
      createdAt: new Date().toISOString(),
    });

    saveStoreData(store);
    refreshStore();
  };

  const analyticsData = computeAnalytics(store);
  const userKycRecord = store.kycRecords.find((k) => k.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-[#07080c] text-gray-100 flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Header Navigation */}
      <HeaderNav
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        allUsers={store.users}
        notifications={store.notifications}
        currentRole={currentRole}
        onToggleRole={handleToggleRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {currentRole === 'MEMBER' ? (
          <MemberPortal
            currentUser={currentUser}
            kycRecord={userKycRecord}
            transactions={store.transactions}
            tables={store.tables}
            memberships={store.memberships}
            notifications={store.notifications}
            onSubmitKyc={handleSubmitKyc}
            onRequestChips={handleRequestChips}
            onJoinTable={handleJoinTable}
          />
        ) : (
          <AdminDashboard
            currentUser={currentUser}
            users={store.users}
            kycRecords={store.kycRecords}
            transactions={store.transactions}
            tables={store.tables}
            memberships={store.memberships}
            notifications={store.notifications}
            auditLogs={store.auditLogs}
            analytics={analyticsData}
            onReviewKyc={handleReviewKyc}
            onAdjustChips={handleAdjustChips}
            onCreateTable={handleCreateTable}
            onBroadcastNotif={handleBroadcastNotif}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d4af37]/20 py-6 px-4 bg-[#090a0f] text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-[#d4af37]" />
            <span className="font-bold text-[#f3e5ab]">MONACO ROYAL POKER CLUB</span>
            <span className="text-[10px] text-gray-400 font-mono">v2.4 Private OS</span>
          </div>
          <p className="text-[11px]">
            Strictly Private & Confidential • High Stakes Operating System & Compliance Ledger
          </p>
          <div className="flex space-x-4 text-[11px] text-[#d4af37]">
            <span>Privacy Standards</span>
            <span>AML Policy</span>
            <span>Concierge Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
