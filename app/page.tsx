'use client';

import React, { useState, useEffect } from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { MemberPortal } from '@/components/MemberPortal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthModal } from '@/components/AuthModal';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import {
  getStoreData,
  approveOrRejectKyc,
  adjustUserChips,
  requestChipBuyInOrCashOut,
  createNewPokerTable,
  computeAnalytics,
  saveStoreData,
} from '@/lib/store';
import { User, KycRecord, NotificationItem } from '@/lib/types';
import { ShieldCheck, ArrowRight, Crown, Sparkles, LogIn } from 'lucide-react';

export default function Home() {
  const [store, setStore] = useState(getStoreData());
  const [currentRole, setCurrentRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Active user state
  const [currentUser, setCurrentUser] = useState<User>(
    store.users.find((u) => u.id === 'usr_2') || store.users[0]
  );

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
      setIsAuthenticated(true);
    } else {
      const memberUser = store.users.find((u) => u.id === 'usr_2') || store.users[0];
      setCurrentUser(memberUser);
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (user.role === 'ADMIN') {
      setCurrentRole('ADMIN');
    } else {
      setCurrentRole('MEMBER');
    }
  };

  // Mandatory Onboarding Wizard Submission
  const handleCompleteWizard = (formData: Partial<KycRecord>) => {
    const existingIndex = store.kycRecords.findIndex((k) => k.userId === currentUser.id);
    const newKyc: KycRecord = {
      id: existingIndex !== -1 ? store.kycRecords[existingIndex].id : `kyc_${Date.now()}`,
      userId: currentUser.id,
      fullName: formData.fullName || currentUser.name,
      dob: formData.dob || '1992-08-14',
      gender: formData.gender || 'MALE',
      phone: formData.phone || currentUser.phone,
      email: formData.email || currentUser.email,
      address: formData.address || '450 Park Avenue',
      city: formData.city || 'New York',
      state: formData.state || 'NY',
      country: formData.country || 'United States',
      govIdType: formData.govIdType || 'PASSPORT',
      govIdNumber: formData.govIdNumber || 'P89302194',
      idDocUrl: formData.idDocUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
      selfieUrl: formData.selfieUrl || currentUser.avatarUrl,
      emergencyContactName: formData.emergencyContactName || 'Viktor Rostova',
      emergencyContactPhone: formData.emergencyContactPhone || '+1 (555) 293-8899',
      referralSource: formData.referralSource || 'Club Invitation',
      submittedAt: new Date().toISOString(),
      status: 'VERIFIED',
    };

    if (existingIndex !== -1) {
      store.kycRecords[existingIndex] = newKyc;
    } else {
      store.kycRecords.unshift(newKyc);
    }

    const uIdx = store.users.findIndex((u) => u.id === currentUser.id);
    if (uIdx !== -1) {
      store.users[uIdx].kycStatus = 'VERIFIED';
    }

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'ONBOARDING_COMPLETED',
      actorId: currentUser.id,
      actorName: currentUser.name,
      targetId: newKyc.id,
      details: `User ${currentUser.name} completed 3-step KYC wizard & unlocked Poker Dashboard`,
      createdAt: new Date().toISOString(),
    });

    saveStoreData(store);
    refreshStore();
    alert('KYC Profile & Verification completed! Poker Dashboard is now unlocked.');
  };

  const handleReviewKyc = (
    kycId: string,
    status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED',
    notes: string
  ) => {
    approveOrRejectKyc(kycId, status, notes, currentUser.name);
    refreshStore();
  };

  const handleAdjustChips = (
    userId: string,
    amount: number,
    isCredit: boolean,
    notes: string
  ) => {
    adjustUserChips(userId, amount, isCredit, notes, currentUser.name);
    refreshStore();
  };

  const handleRequestChips = (
    amount: number,
    type: 'CHIP_BUY_IN' | 'CHIP_CASH_OUT',
    method: 'BANK_WIRE' | 'CRYPTO' | 'CASH' | 'VIP_CREDIT'
  ) => {
    requestChipBuyInOrCashOut(currentUser.id, amount, type, method, currentUser.name);
    refreshStore();
  };

  const handleCreateTable = (tableData: any) => {
    createNewPokerTable(tableData, currentUser.name);
    refreshStore();
  };

  const handleJoinTable = (tableId: string) => {
    const tableIndex = store.tables.findIndex((t) => t.id === tableId);
    if (tableIndex === -1) return;

    const table = store.tables[tableIndex];
    if (table.seatedPlayers.some((p) => p.userId === currentUser.id)) {
      alert(`You are already seated at "${table.name}"!`);
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
    alert(`Successfully seated at "${table.name}" with $${Math.min(table.maxBuyIn, currentUser.chipBalance).toLocaleString()} stack!`);
  };

  const handleLeaveTable = (tableId: string) => {
    const tableIndex = store.tables.findIndex((t) => t.id === tableId);
    if (tableIndex === -1) return;

    const table = store.tables[tableIndex];
    table.seatedPlayers = table.seatedPlayers.filter((p) => p.userId !== currentUser.id);
    table.occupiedSeats = table.seatedPlayers.length;
    if (table.seatedPlayers.length === 0) table.status = 'OPEN';

    saveStoreData(store);
    refreshStore();
    alert(`You stood up and left table "${table.name}". Chips returned to wallet.`);
  };

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
      details: `Dispatched announcement "${title}" via ${channel}`,
      createdAt: new Date().toISOString(),
    });

    saveStoreData(store);
    refreshStore();
  };

  const analyticsData = computeAnalytics(store);
  const userKycRecord = store.kycRecords.find((k) => k.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 flex flex-col font-sans selection:bg-[#ff2d55] selection:text-white">
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
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {!isAuthenticated ? (
          /* Unauthenticated Landing State */
          <div className="text-center py-20 max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#ff2d55]/20 border border-[#ff2d55]/40 flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-[#ff2d55]" />
            </div>
            <h1 className="text-3xl font-extrabold text-white font-serif">
              Monaco Royal Poker Club
            </h1>
            <p className="text-sm text-gray-400">
              High-Stakes Private Operating System. Authenticate to begin onboarding.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn-red-pill px-8 py-3 text-xs font-bold shadow-xl inline-flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Mobile OTP Login</span>
            </button>
          </div>
        ) : currentRole === 'MEMBER' && currentUser.kycStatus === 'NOT_STARTED' ? (
          /* Mandatory Step 2: KYC & Profile Onboarding Wizard */
          <OnboardingWizard
            currentUser={currentUser}
            onCompleteWizard={handleCompleteWizard}
          />
        ) : currentRole === 'MEMBER' ? (
          /* Step 3: Full Member Poker Dashboard Unlocked */
          <MemberPortal
            currentUser={currentUser}
            kycRecord={userKycRecord}
            transactions={store.transactions}
            tables={store.tables}
            memberships={store.memberships}
            notifications={store.notifications}
            onSubmitKyc={handleCompleteWizard}
            onRequestChips={handleRequestChips}
            onJoinTable={handleJoinTable}
            onLeaveTable={handleLeaveTable}
          />
        ) : (
          /* Admin Management Dashboard */
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleSwitchUser}
        existingUsers={store.users}
      />

      {/* Footer */}
      <footer className="border-t border-[#ff2d55]/20 py-6 px-4 bg-black text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#ff2d55]">MONACO ROYAL POKER CLUB</span>
            <span className="text-[10px] text-gray-500 font-mono">v3.2 Gated Onboarding</span>
          </div>
          <p className="text-[11px]">
            Strictly Private & Confidential • High Stakes Operating System
          </p>
          <div className="flex space-x-4 text-[11px] text-[#ff2d55]">
            <span>Privacy Standards</span>
            <span>AML Policy</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
