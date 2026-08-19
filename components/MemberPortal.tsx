'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  Sparkles,
  FileText,
  Upload,
  Camera,
  Download,
  Flame,
  Send,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { User, KycRecord, Transaction, PokerTable, MembershipPlan, NotificationItem } from '@/lib/types';
import { exportTransactionsPDF, exportTransactionsExcel } from '@/lib/reportExporter';

interface MemberPortalProps {
  currentUser: User;
  kycRecord?: KycRecord;
  transactions: Transaction[];
  tables: PokerTable[];
  memberships: MembershipPlan[];
  notifications: NotificationItem[];
  onSubmitKyc: (formData: Partial<KycRecord>) => void;
  onRequestChips: (amount: number, type: 'CHIP_BUY_IN' | 'CHIP_CASH_OUT', method: 'BANK_WIRE' | 'CRYPTO' | 'CASH' | 'VIP_CREDIT') => void;
  onJoinTable: (tableId: string) => void;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({
  currentUser,
  kycRecord,
  transactions,
  tables,
  memberships,
  notifications,
  onSubmitKyc,
  onRequestChips,
  onJoinTable,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'kyc' | 'wallet' | 'tables' | 'membership' | 'notifications'>('overview');

  // KYC Form state
  const [kycForm, setKycForm] = useState({
    fullName: currentUser.name || '',
    dob: kycRecord?.dob || '1990-05-20',
    gender: kycRecord?.gender || 'MALE',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    address: kycRecord?.address || '',
    city: kycRecord?.city || '',
    state: kycRecord?.state || '',
    country: kycRecord?.country || 'United States',
    govIdType: kycRecord?.govIdType || 'PASSPORT',
    govIdNumber: kycRecord?.govIdNumber || '',
    emergencyContactName: kycRecord?.emergencyContactName || '',
    emergencyContactPhone: kycRecord?.emergencyContactPhone || '',
    referralSource: kycRecord?.referralSource || '',
    idDocName: kycRecord ? 'Passport_Document_Verified.pdf' : '',
    selfieName: kycRecord ? 'Selfie_Verification.png' : '',
  });

  // Wallet Modal state
  const [showChipModal, setShowChipModal] = useState(false);
  const [chipActionType, setChipActionType] = useState<'CHIP_BUY_IN' | 'CHIP_CASH_OUT'>('CHIP_BUY_IN');
  const [chipAmount, setChipAmount] = useState<number>(5000);
  const [payMethod, setPayMethod] = useState<'BANK_WIRE' | 'CRYPTO' | 'CASH' | 'VIP_CREDIT'>('BANK_WIRE');

  // Filter state for transaction log
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilterType, setTxnFilterType] = useState<string>('ALL');

  const userTransactions = transactions.filter((t) => t.userId === currentUser.id);

  const filteredTransactions = userTransactions.filter((t) => {
    const matchesSearch = t.txnCode.toLowerCase().includes(txnSearch.toLowerCase()) || (t.notes || '').toLowerCase().includes(txnSearch.toLowerCase());
    const matchesType = txnFilterType === 'ALL' || t.type === txnFilterType;
    return matchesSearch && matchesType;
  });

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitKyc({
      ...kycForm,
      idDocUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
      selfieUrl: currentUser.avatarUrl,
    });
    alert('KYC verification package submitted! Status updated to Under Review.');
  };

  const handleChipRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (chipAmount <= 0) return alert('Please enter a valid chip amount.');
    onRequestChips(chipAmount, chipActionType, payMethod);
    setShowChipModal(false);
    alert(`${chipActionType === 'CHIP_BUY_IN' ? 'Buy-in' : 'Cash-out'} request submitted cleanly!`);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Apple Red Segmented Navigation */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: 'overview', label: 'Overview', icon: Sparkles },
          { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck, badge: currentUser.kycStatus },
          { id: 'wallet', label: 'Apple Wallet', icon: CreditCard },
          { id: 'tables', label: 'Poker Rooms', icon: Flame },
          { id: 'membership', label: 'VIP Pass', icon: Crown },
          { id: 'notifications', label: 'Notifications', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#ff453a] text-white shadow-lg shadow-[#ff453a]/30 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    tab.badge === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : tab.badge === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Apple Red Wallet Pass */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 apple-wallet-card p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-[#ff453a]/30">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-[#ff453a]" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    {currentUser.membershipTier} PASSPORT
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-400">ID: {currentUser.playerCode}</span>
              </div>

              <div className="space-y-1 z-10">
                <span className="text-xs text-gray-400 uppercase font-medium tracking-wider">Available Chips Balance</span>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  ${currentUser.chipBalance.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 z-10">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setChipActionType('CHIP_BUY_IN');
                      setShowChipModal(true);
                    }}
                    className="apple-btn-red flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Buy-In</span>
                  </button>
                  <button
                    onClick={() => {
                      setChipActionType('CHIP_CASH_OUT');
                      setShowChipModal(true);
                    }}
                    className="apple-btn-glass flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Cash Out</span>
                  </button>
                </div>
                <span className="text-[11px] text-gray-400">1 Chip = $1.00 USD • Instant Desk Settlement</span>
              </div>
            </div>

            {/* Profile Glance Widget */}
            <div className="apple-glass p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-white/10">
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#ff453a]/40 shadow-lg"
                />
                <div>
                  <h3 className="text-base font-semibold text-white">{currentUser.name}</h3>
                  <span className="text-xs text-gray-400">{currentUser.email}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between text-gray-300">
                  <span>KYC Status:</span>
                  <strong className="text-emerald-400">{currentUser.kycStatus}</strong>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>VIP Tier:</span>
                  <strong className="text-[#ff453a]">{currentUser.membershipTier}</strong>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Cashout Fee:</span>
                  <strong className="text-white">0.0% (Waived)</strong>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('kyc')}
                className="w-full apple-btn-glass py-2.5 text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <span>View Full Account Details</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* KYC Status Callout Banner */}
          {currentUser.kycStatus !== 'VERIFIED' && (
            <div className="apple-glass-red p-5 rounded-3xl flex items-center justify-between gap-4 border border-[#ff453a]/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ff453a]/20 border border-[#ff453a]/30 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#ff453a]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#ff453a]">KYC Verification Required</h4>
                  <p className="text-xs text-gray-300">Complete identity onboarding to unlock unlimited table stakes.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('kyc')}
                className="apple-btn-red text-xs px-4 py-2 rounded-full whitespace-nowrap"
              >
                Complete KYC
              </button>
            </div>
          )}

          {/* Featured Live Tables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff453a]" /> Featured High-Stakes Tables
              </h3>
              <button onClick={() => setActiveSubTab('tables')} className="text-xs text-gray-400 hover:text-white">
                View All Rooms →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.slice(0, 2).map((tbl) => (
                <div key={tbl.id} className="apple-glass p-6 rounded-3xl space-y-4 border border-white/10 hover:border-[#ff453a]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{tbl.name}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">{tbl.gameType.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#ff453a]/15 text-[#ff453a] text-xs font-mono font-bold border border-[#ff453a]/30">
                      ${tbl.smallBlind}/${tbl.bigBlind}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Buy-In: <strong>${tbl.minBuyIn.toLocaleString()} - ${tbl.maxBuyIn.toLocaleString()}</strong></span>
                    <span>Seats: <strong>{tbl.seatedPlayers.length}/{tbl.maxSeats}</strong></span>
                  </div>

                  <button
                    onClick={() => onJoinTable(tbl.id)}
                    className="w-full apple-btn-red py-2.5 text-xs font-semibold shadow-lg"
                  >
                    Join Table / Take Seat
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KYC VERIFICATION TAB */}
      {activeSubTab === 'kyc' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 apple-glass p-6 rounded-3xl">
            <div>
              <h2 className="text-lg font-semibold text-white">KYC & Compliance Verification</h2>
              <p className="text-xs text-gray-400">
                Identity verification details required under club compliance & AML standards.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                currentUser.kycStatus === 'VERIFIED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : currentUser.kycStatus === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {currentUser.kycStatus}
            </span>
          </div>

          <form onSubmit={handleKycSubmit} className="apple-glass p-6 md:p-8 rounded-3xl space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
                1. Legal Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={kycForm.fullName}
                    onChange={(e) => setKycForm({ ...kycForm, fullName: e.target.value })}
                    className="w-full apple-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={kycForm.dob}
                    onChange={(e) => setKycForm({ ...kycForm, dob: e.target.value })}
                    className="w-full apple-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Gender</label>
                  <select
                    value={kycForm.gender}
                    onChange={(e) => setKycForm({ ...kycForm, gender: e.target.value as any })}
                    className="w-full apple-input p-3 text-xs"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={kycForm.phone}
                    onChange={(e) => setKycForm({ ...kycForm, phone: e.target.value })}
                    className="w-full apple-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={kycForm.email}
                    onChange={(e) => setKycForm({ ...kycForm, email: e.target.value })}
                    className="w-full apple-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={kycForm.country}
                    onChange={(e) => setKycForm({ ...kycForm, country: e.target.value })}
                    className="w-full apple-input p-3 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
                2. Government Document Upload
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">ID Document Type</label>
                  <select
                    value={kycForm.govIdType}
                    onChange={(e) => setKycForm({ ...kycForm, govIdType: e.target.value as any })}
                    className="w-full apple-input p-3 text-xs"
                  >
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="NATIONAL_ID">National ID Card</option>
                    <option value="STATE_ID">State Issued ID</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Serial / ID Number</label>
                  <input
                    type="text"
                    required
                    value={kycForm.govIdNumber}
                    onChange={(e) => setKycForm({ ...kycForm, govIdNumber: e.target.value })}
                    className="w-full apple-input p-3 text-xs"
                  />
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#ff453a]/50 transition-all">
                  <Upload className="w-6 h-6 text-[#ff453a] mb-2" />
                  <span className="text-xs font-medium text-white">Upload Government ID Document</span>
                  <span className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</span>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#ff453a]/50 transition-all">
                  <Camera className="w-6 h-6 text-emerald-400 mb-2" />
                  <span className="text-xs font-medium text-white">Verification Selfie</span>
                  <span className="text-[10px] text-gray-400 mt-1">Front face photo holding ID</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="apple-btn-red px-8 py-3 text-xs font-bold flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Submit Verification Package</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DIGITAL WALLET TAB */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-6">
          <div className="apple-glass p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Digital Chip Wallet</span>
              <div className="text-4xl font-extrabold text-white font-mono">
                ${currentUser.chipBalance.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">Total verified chip balance on club ledger</p>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setChipActionType('CHIP_BUY_IN');
                  setShowChipModal(true);
                }}
                className="apple-btn-red flex-1 md:flex-none px-6 py-3 text-xs font-bold flex items-center justify-center space-x-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Buy-In Chips</span>
              </button>
              <button
                onClick={() => {
                  setChipActionType('CHIP_CASH_OUT');
                  setShowChipModal(true);
                }}
                className="apple-btn-glass flex-1 md:flex-none px-6 py-3 text-xs font-bold flex items-center justify-center space-x-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Cash Out</span>
              </button>
            </div>
          </div>

          <div className="apple-glass p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Personal Transaction History</h3>
                <p className="text-xs text-gray-400">Complete audit log of chip movements</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportTransactionsPDF(userTransactions)}
                  className="apple-btn-glass px-3.5 py-1.5 text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> PDF Export
                </button>
                <button
                  onClick={() => exportTransactionsExcel(userTransactions)}
                  className="apple-btn-glass px-3.5 py-1.5 text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Excel Export
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                placeholder="Search TXN Code..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                className="flex-1 apple-input p-2.5 text-xs"
              />
              <select
                value={txnFilterType}
                onChange={(e) => setTxnFilterType(e.target.value)}
                className="apple-input p-2.5 text-xs"
              >
                <option value="ALL">All Transactions</option>
                <option value="CHIP_BUY_IN">Chip Buy-In</option>
                <option value="CHIP_CASH_OUT">Chip Cash-Out</option>
                <option value="ADMIN_CREDIT">Admin Credit</option>
              </select>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">TXN Code</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Action By</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-all">
                      <td className="py-3 px-3 font-mono font-semibold text-[#ff453a]">{t.txnCode}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium">
                          {t.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-300">{t.method || 'SYSTEM'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">${t.amount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-gray-400">{t.actionBy}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POKER ROOMS TAB */}
      {activeSubTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 apple-glass rounded-3xl">
            <div>
              <h2 className="text-lg font-semibold text-white">Poker Rooms & Seats</h2>
              <p className="text-xs text-gray-400">Join active Texas Hold'em and Omaha PLO tables.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#ff453a]/20 text-[#ff453a] text-xs font-bold border border-[#ff453a]/30">
              {tables.length} Rooms Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tables.map((tbl) => (
              <div key={tbl.id} className="apple-glass p-6 rounded-3xl space-y-4 border border-white/10 hover:border-[#ff453a]/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{tbl.name}</h3>
                    <span className="text-[10px] text-[#ff453a] uppercase font-semibold">{tbl.gameType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-[#ff453a]">
                    Blinds: ${tbl.smallBlind}/${tbl.bigBlind}
                  </span>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl flex justify-between items-center text-xs border border-white/5">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase block">Buy-In Range</span>
                    <span className="text-white font-mono font-bold">${tbl.minBuyIn.toLocaleString()} - ${tbl.maxBuyIn.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase block">Seated Players</span>
                    <span className="text-[#ff453a] font-mono font-bold">{tbl.seatedPlayers.length} / {tbl.maxSeats}</span>
                  </div>
                </div>

                <button
                  onClick={() => onJoinTable(tbl.id)}
                  className="w-full apple-btn-red py-2.5 text-xs font-bold shadow-lg"
                >
                  Join Table & Take Seat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIP MEMBERSHIP TAB */}
      {activeSubTab === 'membership' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2 py-4">
            <h2 className="text-2xl font-bold text-white">VIP Club Pass</h2>
            <p className="text-xs text-gray-400">Unlock higher limit stakes, custom table hosting, and zero cashout fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberships.map((plan) => {
              const isCurrent = currentUser.membershipTier === plan.tier;
              return (
                <div
                  key={plan.id}
                  className={`apple-glass p-6 rounded-3xl space-y-6 flex flex-col justify-between border transition-all ${
                    isCurrent ? 'apple-glass-red border-[#ff453a]' : 'border-white/10'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ff453a] uppercase">{plan.tier}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ff453a] text-white text-[10px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{plan.name}</h3>
                      <div className="text-2xl font-black text-white mt-1 font-mono">
                        ${plan.priceMonthly}<span className="text-xs text-gray-400 font-sans font-normal">/mo</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Max Limit:</span>
                        <strong className="text-white font-mono">${plan.maxTableLimit.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Cashout Fee:</span>
                        <strong className="text-[#ff453a] font-mono">{plan.cashoutFeePercent}%</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => alert(`Upgrade request submitted for ${plan.name}`)}
                    className={`w-full py-2.5 text-xs font-bold ${
                      isCurrent ? 'bg-white/10 text-gray-500 rounded-full cursor-not-allowed' : 'apple-btn-red'
                    }`}
                  >
                    {isCurrent ? 'Active Plan' : 'Request Upgrade'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeSubTab === 'notifications' && (
        <div className="apple-glass p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Notifications Feed</h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#ff453a]">{n.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 font-mono">
                      {n.channel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{n.message}</p>
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHIP BUY-IN / CASH-OUT MODAL */}
      {showChipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="apple-glass-red p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 border border-[#ff453a]/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {chipActionType === 'CHIP_BUY_IN' ? 'Request Chip Buy-In' : 'Request Chip Cash-Out'}
              </h3>
              <button onClick={() => setShowChipModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleChipRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1">Chip Amount ($USD Equivalent)</label>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={chipAmount}
                  onChange={(e) => setChipAmount(Number(e.target.value))}
                  className="w-full apple-input p-3 text-lg font-bold font-mono text-[#ff453a]"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Settlement Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full apple-input p-3 text-xs"
                >
                  <option value="BANK_WIRE">Bank Wire Transfer</option>
                  <option value="CRYPTO">Cryptocurrency (USDT / BTC)</option>
                  <option value="CASH">Counter Cash Deposit</option>
                  <option value="VIP_CREDIT">VIP Credit Line</option>
                </select>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowChipModal(false)}
                  className="flex-1 apple-btn-glass py-2.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 apple-btn-red py-2.5 text-xs font-bold">
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
