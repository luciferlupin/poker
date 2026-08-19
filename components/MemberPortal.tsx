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
  Trophy,
  Check,
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
  onRequestChips: (amount: number, type: 'CHIP_BUY_IN' | 'CHIP_CASH_OUT', method: 'UPI' | 'IMPS_BANK_TRANSFER' | 'CASH' | 'VIP_CREDIT') => void;
  onJoinTable: (tableId: string) => void;
  onLeaveTable?: (tableId: string) => void;
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
  onLeaveTable,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'table_felt' | 'kyc' | 'wallet' | 'tables' | 'membership' | 'notifications'>('overview');

  // Selected Table for Oval Visual Room
  const [selectedOvalTable, setSelectedOvalTable] = useState<PokerTable>(tables[0] || {} as any);

  // KYC Form state + live uploader thumbnail previews
  const [kycForm, setKycForm] = useState({
    fullName: currentUser.name || '',
    dob: kycRecord?.dob || '1988-07-14',
    gender: kycRecord?.gender || 'MALE',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    address: kycRecord?.address || '14 Marine Drive Penthouse',
    city: kycRecord?.city || 'Mumbai',
    state: kycRecord?.state || 'Maharashtra',
    country: kycRecord?.country || 'India',
    govIdType: kycRecord?.govIdType || 'AADHAAR',
    govIdNumber: kycRecord?.govIdNumber || '9928-1102-4491',
    emergencyContactName: kycRecord?.emergencyContactName || 'Priya Oberoi',
    emergencyContactPhone: kycRecord?.emergencyContactPhone || '+91 98111 22335',
    referralSource: kycRecord?.referralSource || 'Vikramaditya Singhania',
    idDocUrl: kycRecord?.idDocUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
    selfieUrl: kycRecord?.selfieUrl || currentUser.avatarUrl,
  });

  // Wallet Modal state
  const [showChipModal, setShowChipModal] = useState(false);
  const [chipActionType, setChipActionType] = useState<'CHIP_BUY_IN' | 'CHIP_CASH_OUT'>('CHIP_BUY_IN');
  const [chipAmount, setChipAmount] = useState<number>(500000);
  const [payMethod, setPayMethod] = useState<'UPI' | 'IMPS_BANK_TRANSFER' | 'CASH' | 'VIP_CREDIT'>('UPI');
  const [upiIdInput, setUpiIdInput] = useState('oberoi@paytm');

  // Filter state for transaction log
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilterType, setTxnFilterType] = useState<string>('ALL');

  const userTransactions = transactions.filter((t) => t.userId === currentUser.id);

  const filteredTransactions = userTransactions.filter((t) => {
    const matchesSearch = t.txnCode.toLowerCase().includes(txnSearch.toLowerCase()) || (t.notes || '').toLowerCase().includes(txnSearch.toLowerCase());
    const matchesType = txnFilterType === 'ALL' || t.type === txnFilterType;
    return matchesSearch && matchesType;
  });

  const handleIdDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKycForm({ ...kycForm, idDocUrl: URL.createObjectURL(file) });
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKycForm({ ...kycForm, selfieUrl: URL.createObjectURL(file) });
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitKyc({
      ...kycForm,
    });
    alert('Aadhaar/PAN KYC verification package submitted cleanly!');
  };

  const handleChipRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (chipAmount <= 0) return alert('Please enter a valid chip amount.');
    onRequestChips(chipAmount, chipActionType, payMethod);
    setShowChipModal(false);
    alert(`${chipActionType === 'CHIP_BUY_IN' ? 'Buy-in' : 'Cash-out'} request of ₹${chipAmount.toLocaleString('en-IN')} via ${payMethod} submitted cleanly!`);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Sub Navigation Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-[#ff2d55]/25">
        {[
          { id: 'overview', label: 'Overview', icon: Sparkles },
          { id: 'table_felt', label: 'Visual Table Felt Room', icon: Flame },
          { id: 'kyc', label: 'Aadhaar / PAN KYC', icon: ShieldCheck, badge: currentUser.kycStatus },
          { id: 'wallet', label: 'Rupee Chip Wallet', icon: CreditCard },
          { id: 'tables', label: 'Live Indian Rooms', icon: Trophy },
          { id: 'membership', label: 'VIP Pass', icon: Crown },
          { id: 'notifications', label: 'Notifications', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'btn-red-pill text-white shadow-lg shadow-[#ff2d55]/30 scale-105'
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Red Metallic Indian Pass */}
            <div className="lg:col-span-2 red-metallic-card p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-[#ff2d55]/40">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-[#ff2d55]" />
                  <span className="text-xs font-extrabold text-[#ff2d55] tracking-widest uppercase">
                    {currentUser.membershipTier} HIGH ROLLER PASSPORT
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-300">MEMBER CODE: <strong>{currentUser.playerCode}</strong></span>
              </div>

              <div className="space-y-1 z-10">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Verified Indian Rupee Chips</span>
                <div className="text-4xl sm:text-5xl font-black text-red-gradient font-mono tracking-tight">
                  ₹{currentUser.chipBalance.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ff2d55]/25 z-10">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setChipActionType('CHIP_BUY_IN');
                      setShowChipModal(true);
                    }}
                    className="btn-red-pill flex-1 sm:flex-none px-6 py-2.5 text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow-lg"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>UPI / IMPS Buy-In</span>
                  </button>
                  <button
                    onClick={() => {
                      setChipActionType('CHIP_CASH_OUT');
                      setShowChipModal(true);
                    }}
                    className="btn-glass-red flex-1 sm:flex-none px-6 py-2.5 text-xs font-extrabold flex items-center justify-center space-x-1.5"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Instant Cash Out</span>
                  </button>
                </div>
                <span className="text-[11px] text-gray-300 font-medium">1 Chip = ₹1.00 INR • Instant Settlement</span>
              </div>
            </div>

            {/* Indian High-Stakes Player Stats Widget */}
            <div className="red-glass p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-[#ff2d55]/30">
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#ff2d55] shadow-lg"
                />
                <div>
                  <h3 className="text-base font-bold text-white font-serif">{currentUser.name}</h3>
                  <span className="text-xs text-[#ff2d55] font-mono font-semibold">India Rank #2 • VPIP 32%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#000000]/80 p-3 rounded-2xl border border-[#ff2d55]/20">
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Win Rate</span>
                  <strong className="text-emerald-400 font-mono text-sm">68.5%</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase">Total Winnings</span>
                  <strong className="text-[#ff2d55] font-mono text-sm">₹85,00,000</strong>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('table_felt')}
                className="w-full btn-red-pill py-2.5 text-xs font-bold flex items-center justify-center space-x-1"
              >
                <span>Enter Visual Table Felt Room</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* KYC Callout */}
          {currentUser.kycStatus !== 'VERIFIED' && (
            <div className="red-glass-bright p-5 rounded-3xl flex items-center justify-between gap-4 border border-[#ff2d55]/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ff2d55]/20 border border-[#ff2d55]/40 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#ff2d55]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#ff2d55]">Aadhaar / PAN KYC Required ({currentUser.kycStatus})</h4>
                  <p className="text-xs text-gray-300">Complete verification to unlock high stakes rooms.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('kyc')}
                className="btn-red-pill text-xs px-4 py-2 rounded-full whitespace-nowrap"
              >
                Submit Aadhaar / PAN
              </button>
            </div>
          )}

          {/* Active Live Rooms */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                <Flame className="w-4 h-4 text-[#ff2d55]" /> Active Indian Poker Rooms
              </h3>
              <button onClick={() => setActiveSubTab('tables')} className="text-xs text-[#ff2d55] hover:underline">
                View All Rooms →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.slice(0, 2).map((tbl) => (
                <div key={tbl.id} className="red-glass p-6 rounded-3xl space-y-4 border border-[#ff2d55]/30 hover:border-[#ff2d55] transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-serif">{tbl.name}</h4>
                      <span className="text-[10px] text-[#ff2d55] font-bold uppercase">{tbl.gameType.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#ff2d55]/20 text-[#ff2d55] text-xs font-mono font-bold border border-[#ff2d55]/30">
                      Blinds: ₹{tbl.smallBlind.toLocaleString('en-IN')}/₹{tbl.bigBlind.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Stakes: <strong>₹{tbl.minBuyIn.toLocaleString('en-IN')} - ₹{tbl.maxBuyIn.toLocaleString('en-IN')}</strong></span>
                    <span>Seated: <strong>{tbl.seatedPlayers.length}/{tbl.maxSeats} Players</strong></span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOvalTable(tbl);
                        setActiveSubTab('table_felt');
                      }}
                      className="flex-1 btn-glass-red py-2.5 text-xs font-bold"
                    >
                      View Oval Felt
                    </button>
                    <button
                      onClick={() => onJoinTable(tbl.id)}
                      className="flex-1 btn-red-pill py-2.5 text-xs font-extrabold shadow-lg"
                    >
                      Take a Seat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISUAL POKER TABLE OVAL ROOM TAB */}
      {activeSubTab === 'table_felt' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 red-glass p-5 rounded-3xl border border-[#ff2d55]/40">
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Visual Oval Poker Table Room</h2>
              <p className="text-xs text-gray-300">Live seat layout, pot tracker, dealer button, and active player stacks</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Select Room:</span>
              <select
                value={selectedOvalTable.id}
                onChange={(e) => {
                  const t = tables.find((tbl) => tbl.id === e.target.value);
                  if (t) setSelectedOvalTable(t);
                }}
                className="red-input p-2 text-xs font-bold"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} (₹{t.smallBlind}/₹{t.bigBlind})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Oval Table Felt Layout */}
          <div className="red-glass p-6 md:p-12 rounded-3xl border border-[#ff2d55]/40 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-3xl h-[380px] sm:h-[440px] red-felt-oval flex flex-col items-center justify-center relative shadow-2xl">
              {/* Table Center Info */}
              <div className="text-center space-y-1 bg-[#000000]/90 px-6 py-3 rounded-full border border-[#ff2d55]/50 backdrop-blur-md shadow-2xl z-10">
                <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest block">Current Total Pot</span>
                <div className="text-2xl sm:text-3xl font-black text-[#ff2d55] font-mono">₹2,50,000</div>
                <div className="text-[10px] text-white font-bold uppercase">{selectedOvalTable.name} • ₹{selectedOvalTable.smallBlind}/₹{selectedOvalTable.bigBlind}</div>
              </div>

              {/* Seated Players Grid */}
              {[
                { pos: 'top-3 left-1/2 -translate-x-1/2', seatNum: 1 },
                { pos: 'top-16 right-6', seatNum: 2 },
                { pos: 'bottom-16 right-6', seatNum: 3 },
                { pos: 'bottom-3 left-1/2 -translate-x-1/2', seatNum: 4 },
                { pos: 'bottom-16 left-6', seatNum: 5 },
                { pos: 'top-16 left-6', seatNum: 6 },
              ].map((seat, idx) => {
                const player = selectedOvalTable.seatedPlayers[idx];
                const isCurrentUserSeated = player && player.userId === currentUser.id;
                return (
                  <div key={idx} className={`absolute ${seat.pos} flex flex-col items-center z-20`}>
                    {player ? (
                      <div className="flex flex-col items-center space-y-1 bg-[#000000]/90 p-2 rounded-2xl border border-[#ff2d55]/60 shadow-xl backdrop-blur-md">
                        <div className="relative">
                          <img src={player.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-[#ff2d55]" alt="" />
                          {idx === 0 && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#ff2d55] text-white text-[9px] font-black flex items-center justify-center border border-black">
                              D
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-white whitespace-nowrap">{player.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-[#ff2d55] font-mono font-extrabold">₹{(player.stack / 100000).toFixed(1)}L</span>
                        {isCurrentUserSeated && onLeaveTable && (
                          <button
                            onClick={() => onLeaveTable(selectedOvalTable.id)}
                            className="text-[9px] text-red-400 hover:underline mt-0.5"
                          >
                            Stand Up
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onJoinTable(selectedOvalTable.id)}
                        className="w-12 h-12 rounded-full border-2 border-dashed border-[#ff2d55]/40 bg-[#000000]/60 hover:border-[#ff2d55] text-[10px] text-gray-400 font-bold flex items-center justify-center transition-all hover:scale-105"
                      >
                        Seat {seat.seatNum}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-6 w-full max-w-md">
              <button
                onClick={() => onJoinTable(selectedOvalTable.id)}
                className="w-full btn-red-pill py-3 text-xs font-extrabold shadow-xl"
              >
                Join {selectedOvalTable.name} & Take Seat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC VERIFICATION TAB */}
      {activeSubTab === 'kyc' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 red-glass p-6 rounded-3xl">
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Indian Aadhaar & PAN KYC Compliance</h2>
              <p className="text-xs text-gray-300">Identity verification under Indian Poker Club Standards.</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                currentUser.kycStatus === 'VERIFIED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : currentUser.kycStatus === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {currentUser.kycStatus}
            </span>
          </div>

          <form onSubmit={handleKycSubmit} className="red-glass p-6 md:p-8 rounded-3xl space-y-8 border border-[#ff2d55]/30">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#ff2d55] uppercase tracking-wider border-b border-[#ff2d55]/20 pb-2">
                1. Legal Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={kycForm.fullName}
                    onChange={(e) => setKycForm({ ...kycForm, fullName: e.target.value })}
                    className="w-full red-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={kycForm.dob}
                    onChange={(e) => setKycForm({ ...kycForm, dob: e.target.value })}
                    className="w-full red-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Gender</label>
                  <select
                    value={kycForm.gender}
                    onChange={(e) => setKycForm({ ...kycForm, gender: e.target.value as any })}
                    className="w-full red-input p-3 text-xs"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Mobile Phone (+91)</label>
                  <input
                    type="text"
                    required
                    value={kycForm.phone}
                    onChange={(e) => setKycForm({ ...kycForm, phone: e.target.value })}
                    className="w-full red-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={kycForm.email}
                    onChange={(e) => setKycForm({ ...kycForm, email: e.target.value })}
                    className="w-full red-input p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={kycForm.city}
                    onChange={(e) => setKycForm({ ...kycForm, city: e.target.value })}
                    className="w-full red-input p-3 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Indian Document Upload */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#ff2d55] uppercase tracking-wider border-b border-[#ff2d55]/20 pb-2">
                2. Identity Verification (Aadhaar / PAN Card)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Indian Gov ID Type</label>
                  <select
                    value={kycForm.govIdType}
                    onChange={(e) => setKycForm({ ...kycForm, govIdType: e.target.value as any })}
                    className="w-full red-input p-3 text-xs font-bold"
                  >
                    <option value="AADHAAR">Aadhaar Card (12-Digit)</option>
                    <option value="PAN_CARD">PAN Card (10-Digit Alphanumeric)</option>
                    <option value="DRIVING_LICENSE">Indian Driving Licence</option>
                    <option value="PASSPORT">Indian Passport</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Aadhaar / PAN Number</label>
                  <input
                    type="text"
                    required
                    value={kycForm.govIdNumber}
                    onChange={(e) => setKycForm({ ...kycForm, govIdNumber: e.target.value })}
                    className="w-full red-input p-3 text-xs"
                  />
                </div>

                {/* ID Upload Box */}
                <div className="p-4 rounded-2xl bg-[#000000]/80 border border-dashed border-[#ff2d55]/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {kycForm.idDocUrl ? (
                    <div className="w-full space-y-2">
                      <img src={kycForm.idDocUrl} alt="Aadhaar/PAN Preview" className="w-full h-32 object-cover rounded-xl border border-[#ff2d55]/40" />
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Aadhaar/PAN Document Attached
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#ff2d55] mb-2" />
                      <span className="text-xs font-bold text-white">Upload Aadhaar / PAN Document</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleIdDocUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                {/* Selfie Upload Box */}
                <div className="p-4 rounded-2xl bg-[#000000]/80 border border-dashed border-[#ff2d55]/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {kycForm.selfieUrl ? (
                    <div className="w-full space-y-2">
                      <img src={kycForm.selfieUrl} alt="Selfie Preview" className="w-full h-32 object-cover rounded-xl border border-emerald-500/40" />
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Verification Selfie Attached
                      </span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-emerald-400 mb-2" />
                      <span className="text-xs font-bold text-white">Upload Live Selfie</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleSelfieUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="btn-red-pill px-8 py-3 text-xs font-extrabold flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Submit Aadhaar / PAN Verification</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DIGITAL WALLET TAB */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-6">
          <div className="red-glass p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#ff2d55]/30">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rupee Digital Poker Wallet</span>
              <div className="text-4xl font-extrabold text-[#ff2d55] font-mono">
                ₹{currentUser.chipBalance.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-gray-300">Verified available Rupee chips on club ledger</p>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setChipActionType('CHIP_BUY_IN');
                  setShowChipModal(true);
                }}
                className="btn-red-pill flex-1 md:flex-none px-6 py-3 text-xs font-bold flex items-center justify-center space-x-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>UPI / IMPS Buy-In</span>
              </button>
              <button
                onClick={() => {
                  setChipActionType('CHIP_CASH_OUT');
                  setShowChipModal(true);
                }}
                className="btn-glass-red flex-1 md:flex-none px-6 py-3 text-xs font-bold flex items-center justify-center space-x-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Instant Cash-Out</span>
              </button>
            </div>
          </div>

          <div className="red-glass p-6 rounded-3xl space-y-4 border border-[#ff2d55]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white font-serif">Rupee Transaction Ledger</h3>
                <p className="text-xs text-gray-400">Complete audit log of chip buy-ins & payouts</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportTransactionsPDF(userTransactions)}
                  className="btn-glass-red px-3.5 py-1.5 text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> PDF Export
                </button>
                <button
                  onClick={() => exportTransactionsExcel(userTransactions)}
                  className="btn-glass-red px-3.5 py-1.5 text-xs font-bold flex items-center gap-1"
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
                className="flex-1 red-input p-2.5 text-xs"
              />
              <select
                value={txnFilterType}
                onChange={(e) => setTxnFilterType(e.target.value)}
                className="red-input p-2.5 text-xs font-bold"
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
                  <tr className="border-b border-[#ff2d55]/20 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">TXN Code</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Settlement Method</th>
                    <th className="py-3 px-3">Amount (INR)</th>
                    <th className="py-3 px-3">Action By</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-all">
                      <td className="py-3 px-3 font-mono font-bold text-[#ff2d55]">{t.txnCode}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#ff2d55]/15 text-[#ff2d55] text-xs font-bold">
                          {t.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-300">{t.method || 'SYSTEM'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">₹{t.amount.toLocaleString('en-IN')}</td>
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
          <div className="flex items-center justify-between p-6 red-glass rounded-3xl border border-[#ff2d55]/30">
            <div>
              <h2 className="text-lg font-bold text-white font-serif">High-Stakes Indian Poker Rooms</h2>
              <p className="text-xs text-gray-300">Goa Offshore, Mumbai VIP, Bengaluru Tech Cash Games.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#ff2d55]/20 text-[#ff2d55] text-xs font-bold border border-[#ff2d55]/30">
              {tables.length} Rooms Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tables.map((tbl) => (
              <div key={tbl.id} className="red-glass p-6 rounded-3xl space-y-4 border border-[#ff2d55]/30 hover:border-[#ff2d55] transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">{tbl.name}</h3>
                    <span className="text-[10px] text-[#ff2d55] font-bold uppercase">{tbl.gameType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#ff2d55]/20 text-[#ff2d55] text-xs font-mono font-bold">
                    Blinds: ₹{tbl.smallBlind.toLocaleString('en-IN')}/₹{tbl.bigBlind.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-[#000000]/80 p-3 rounded-2xl flex justify-between items-center text-xs border border-[#ff2d55]/20">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase block">Buy-In Range</span>
                    <span className="text-white font-mono font-bold">₹{tbl.minBuyIn.toLocaleString('en-IN')} - ₹{tbl.maxBuyIn.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase block">Seated Players</span>
                    <span className="text-[#ff2d55] font-mono font-bold">{tbl.seatedPlayers.length} / {tbl.maxSeats}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedOvalTable(tbl);
                      setActiveSubTab('table_felt');
                    }}
                    className="flex-1 btn-glass-red py-2.5 text-xs font-bold"
                  >
                    View Oval Felt
                  </button>
                  <button
                    onClick={() => onJoinTable(tbl.id)}
                    className="flex-1 btn-red-pill py-2.5 text-xs font-extrabold shadow-lg"
                  >
                    Take a Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIP MEMBERSHIP TAB */}
      {activeSubTab === 'membership' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2 py-4">
            <h2 className="text-2xl font-bold text-white font-serif">Indian VIP High Roller Pass</h2>
            <p className="text-xs text-gray-300">Unlock higher table stakes, private jet escorts, and zero cashout fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberships.map((plan) => {
              const isCurrent = currentUser.membershipTier === plan.tier;
              return (
                <div
                  key={plan.id}
                  className={`red-glass p-6 rounded-3xl space-y-6 flex flex-col justify-between border transition-all ${
                    isCurrent ? 'red-glass-bright border-[#ff2d55]' : 'border-gray-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ff2d55] uppercase">{plan.tier}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ff2d55] text-white text-[10px] font-extrabold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white font-serif">{plan.name}</h3>
                      <div className="text-2xl font-black text-white mt-1 font-mono">
                        ₹{plan.priceMonthly.toLocaleString('en-IN')}<span className="text-xs text-gray-400 font-sans font-normal">/mo</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#ff2d55]/20 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Max Stakes Limit:</span>
                        <strong className="text-white font-mono">₹{(plan.maxTableLimit / 100000).toFixed(0)} Lakh</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Cashout Fee:</span>
                        <strong className="text-[#ff2d55] font-mono">{plan.cashoutFeePercent}%</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => alert(`Upgrade request submitted for ${plan.name}`)}
                    className={`w-full py-2.5 text-xs font-extrabold ${
                      isCurrent ? 'bg-gray-800 text-gray-500 rounded-full cursor-not-allowed' : 'btn-red-pill shadow-lg'
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
        <div className="red-glass p-6 rounded-3xl space-y-4 border border-[#ff2d55]/30">
          <h3 className="text-sm font-bold text-[#ff2d55] font-serif">Notifications Feed</h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-[#000000]/80 border border-[#ff2d55]/20 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#ff2d55]">{n.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0e0e14] text-gray-400 font-mono">
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

      {/* UPI / IMPS BUY-IN / CASH-OUT MODAL */}
      {showChipModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="red-glass-bright p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 border border-[#ff2d55] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ff2d55]/20 pb-3">
              <h3 className="text-base font-bold text-white font-serif">
                {chipActionType === 'CHIP_BUY_IN' ? 'Request Rupee Chip Buy-In' : 'Request Rupee Cash-Out'}
              </h3>
              <button onClick={() => setShowChipModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleChipRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-bold">Chip Amount (Rupees ₹)</label>
                <input
                  type="number"
                  min={10000}
                  step={50000}
                  value={chipAmount}
                  onChange={(e) => setChipAmount(Number(e.target.value))}
                  className="w-full red-input p-3 text-lg font-bold font-mono text-[#ff2d55]"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-bold">Indian Settlement Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full red-input p-3 text-xs font-bold"
                >
                  <option value="UPI">Instant UPI (Paytm, GPay, PhonePe)</option>
                  <option value="IMPS_BANK_TRANSFER">IMPS / NEFT Direct Bank Transfer</option>
                  <option value="CASH">Counter Cash Deposit</option>
                  <option value="VIP_CREDIT">High Roller Line of Credit</option>
                </select>
              </div>

              {payMethod === 'UPI' && (
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Your Virtual Payment Address (UPI ID)</label>
                  <input
                    type="text"
                    required
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    className="w-full red-input p-3 font-mono text-white"
                  />
                </div>
              )}

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowChipModal(false)}
                  className="flex-1 btn-glass-red py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-red-pill py-2.5 text-xs font-extrabold shadow-lg">
                  Confirm Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
