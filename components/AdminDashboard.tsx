'use client';

import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Coins,
  DollarSign,
  TrendingUp,
  Flame,
  Plus,
  Search,
  Download,
  Eye,
  Bell,
  FileSpreadsheet,
  Lock,
  Crown,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { User, KycRecord, Transaction, PokerTable, MembershipPlan, NotificationItem, AuditLog, AnalyticsSummary } from '@/lib/types';
import {
  exportTransactionsPDF,
  exportTransactionsExcel,
  exportKycReportPDF,
  exportKycReportExcel,
  exportChipCirculationPDF,
  exportChipCirculationExcel,
  exportMembershipReportPDF,
} from '@/lib/reportExporter';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  kycRecords: KycRecord[];
  transactions: Transaction[];
  tables: PokerTable[];
  memberships: MembershipPlan[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  analytics: AnalyticsSummary;
  onReviewKyc: (kycId: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED', notes: string) => void;
  onAdjustChips: (userId: string, amount: number, isCredit: boolean, notes: string) => void;
  onCreateTable: (tableData: Omit<PokerTable, 'id' | 'seatedPlayers' | 'createdAt' | 'occupiedSeats'>) => void;
  onBroadcastNotif: (title: string, message: string, channel: 'PUSH' | 'EMAIL' | 'WHATSAPP') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  kycRecords,
  transactions,
  tables,
  memberships,
  notifications,
  auditLogs,
  analytics,
  onReviewKyc,
  onAdjustChips,
  onCreateTable,
  onBroadcastNotif,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'analytics' | 'users' | 'kyc' | 'wallet' | 'tables' | 'memberships' | 'notifications' | 'reports' | 'audit'
  >('analytics');

  // Selected Item Modals
  const [inspectKyc, setInspectKyc] = useState<KycRecord | null>(null);
  const [kycNotesInput, setKycNotesInput] = useState('');

  const [inspectUser, setInspectUser] = useState<User | null>(null);

  const [chipModalUser, setChipModalUser] = useState<User | null>(null);
  const [chipModalAmount, setChipModalAmount] = useState<number>(5000);
  const [chipModalIsCredit, setChipModalIsCredit] = useState<boolean>(true);
  const [chipModalNotes, setChipModalNotes] = useState<string>('');

  const [showCreateTableModal, setShowCreateTableModal] = useState<boolean>(false);
  const [newTableForm, setNewTableForm] = useState({
    name: 'Macau High Stakes Hold\'em',
    gameType: 'TEXAS_HOLDEM' as any,
    minBuyIn: 5000,
    maxBuyIn: 50000,
    smallBlind: 50,
    bigBlind: 100,
    maxSeats: 6,
    status: 'OPEN' as any,
  });

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState<'PUSH' | 'EMAIL' | 'WHATSAPP'>('PUSH');

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('ALL');

  const [kycSearch, setKycSearch] = useState('');
  const [kycFilterStatus, setKycFilterStatus] = useState('ALL');

  const [txnSearch, setTxnSearch] = useState('');

  // Recharts Sample Data
  const chartLineData = [
    { day: 'Mon', volume: 120000, chips: 450000 },
    { day: 'Tue', volume: 180000, chips: 480000 },
    { day: 'Wed', volume: 240000, chips: 520000 },
    { day: 'Thu', volume: 210000, chips: 590000 },
    { day: 'Fri', volume: 380000, chips: 640000 },
    { day: 'Sat', volume: 510000, chips: 720000 },
    { day: 'Sun', volume: 490000, chips: 780000 },
  ];

  const pieColors = ['#f5d061', '#00f0a8', '#3b82f6', '#ec4899'];
  const chartPieData = memberships.map((m) => ({
    name: m.name,
    value: m.activeMembersCount,
  }));

  const filteredUsers = users.filter((u) => {
    const matchText = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.playerCode.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userFilterRole === 'ALL' || u.role === userFilterRole;
    return matchText && matchRole;
  });

  const filteredKyc = kycRecords.filter((k) => {
    const matchText = k.fullName.toLowerCase().includes(kycSearch.toLowerCase()) || k.email.toLowerCase().includes(kycSearch.toLowerCase()) || k.govIdNumber.toLowerCase().includes(kycSearch.toLowerCase());
    const matchStatus = kycFilterStatus === 'ALL' || k.status === kycFilterStatus;
    return matchText && matchStatus;
  });

  const filteredTransactions = transactions.filter((t) => {
    return t.txnCode.toLowerCase().includes(txnSearch.toLowerCase()) || t.userName.toLowerCase().includes(txnSearch.toLowerCase());
  });

  const handleChipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chipModalUser) return;
    onAdjustChips(chipModalUser.id, chipModalAmount, chipModalIsCredit, chipModalNotes);
    setChipModalUser(null);
    alert(`Successfully ${chipModalIsCredit ? 'credited' : 'deducted'} ${chipModalAmount.toLocaleString()} chips for ${chipModalUser.name}`);
  };

  const handleTableCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTable(newTableForm);
    setShowCreateTableModal(false);
    alert(`New Table "${newTableForm.name}" launched successfully!`);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    onBroadcastNotif(broadcastTitle, broadcastMessage, broadcastChannel);
    setBroadcastTitle('');
    setBroadcastMessage('');
    alert(`Broadcast announcement dispatched via ${broadcastChannel}!`);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Admin 24k Gold Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-[#f5d061]/25">
        {[
          { id: 'analytics', label: 'Executive Analytics', icon: TrendingUp },
          { id: 'kyc', label: 'KYC Queue', icon: ShieldCheck, badge: kycRecords.filter((k) => k.status === 'PENDING').length },
          { id: 'users', label: 'Member Directory', icon: Users },
          { id: 'wallet', label: 'Chip Ledger', icon: Coins },
          { id: 'tables', label: 'Poker Rooms', icon: Flame },
          { id: 'memberships', label: 'Plans', icon: Crown },
          { id: 'notifications', label: 'Broadcast', icon: Bell },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
          { id: 'audit', label: 'Audit Logs', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'btn-24k-gold text-[#050608] shadow-lg shadow-[#f5d061]/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#050608]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#00f0a8] text-black font-extrabold text-[9px]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* EXECUTIVE ANALYTICS TAB */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="gold-glass p-5 rounded-3xl space-y-2 border border-[#f5d061]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Total Club Members</span>
                <Users className="w-4 h-4 text-[#f5d061]" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{analytics.totalMembers}</div>
              <div className="text-[10px] text-emerald-400 font-bold">
                {analytics.verifiedMembers} Verified ({((analytics.verifiedMembers / analytics.totalMembers) * 100).toFixed(0)}%)
              </div>
            </div>

            <div className="gold-glass p-5 rounded-3xl space-y-2 border border-[#f5d061]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Pending KYC</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">{analytics.pendingKyc}</div>
              <p className="text-[10px] text-gray-400">Under review in queue</p>
            </div>

            <div className="gold-glass p-5 rounded-3xl space-y-2 border border-[#f5d061]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Chips Circulation</span>
                <Coins className="w-4 h-4 text-[#f5d061]" />
              </div>
              <div className="text-3xl font-extrabold text-gold-24k font-mono">
                ${(analytics.totalChipsCirculation / 1000).toFixed(0)}k
              </div>
              <p className="text-[10px] text-gray-400">Total player balance</p>
            </div>

            <div className="gold-glass p-5 rounded-3xl space-y-2 border border-[#f5d061]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Monthly Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                ${analytics.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-gray-400">VIP Subscription dues</p>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 gold-glass p-6 rounded-3xl space-y-4 border border-[#f5d061]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-serif">7-Day Chip Circulation & Volume</h3>
                  <p className="text-xs text-gray-400">Throughput transaction analysis</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#f5d061]/20 text-[#f5d061] font-mono font-bold">
                  Weekly
                </span>
              </div>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartLineData}>
                    <XAxis dataKey="day" stroke="#626c85" fontSize={11} />
                    <YAxis stroke="#626c85" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#050608', borderColor: '#f5d061', borderRadius: '14px' }}
                      labelStyle={{ color: '#f5d061', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="chips" stroke="#f5d061" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="volume" stroke="#00f0a8" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="gold-glass p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-[#f5d061]/30">
              <div>
                <h3 className="text-sm font-bold text-white font-serif">Membership Tier Breakdown</h3>
                <p className="text-xs text-gray-400">Member plan distribution</p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {chartPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#050608', borderColor: '#f5d061' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                {chartPieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                    <span className="text-gray-300 text-[11px]">{entry.name}: <strong>{entry.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC QUEUE TAB */}
      {activeAdminTab === 'kyc' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 gold-glass p-5 rounded-3xl border border-[#f5d061]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">KYC Verification Queue</h2>
              <p className="text-xs text-gray-400">Inspect submitted identity documents and selfies</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search member..."
                value={kycSearch}
                onChange={(e) => setKycSearch(e.target.value)}
                className="poker-input p-2 text-xs"
              />
              <select
                value={kycFilterStatus}
                onChange={(e) => setKycFilterStatus(e.target.value)}
                className="poker-input p-2 text-xs font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="gold-glass p-6 rounded-3xl overflow-x-auto border border-[#f5d061]/30">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f5d061]/20 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Applicant Name</th>
                  <th className="py-3 px-3">Gov ID Type</th>
                  <th className="py-3 px-3">ID Number</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredKyc.map((k) => (
                  <tr key={k.id} className="hover:bg-[#181d2c] transition-all">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{k.fullName}</div>
                      <div className="text-[10px] text-gray-400">{k.email}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-mono">{k.govIdType}</td>
                    <td className="py-3 px-3 text-gray-300 font-mono">{k.govIdNumber}</td>
                    <td className="py-3 px-3 text-gray-300">{k.country}</td>
                    <td className="py-3 px-3 text-gray-400">{new Date(k.submittedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setInspectKyc(k);
                          setKycNotesInput(k.notes || '');
                        }}
                        className="btn-24k-gold text-[11px] px-3 py-1.5 flex items-center gap-1 ml-auto shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MEMBER DIRECTORY TAB */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 gold-glass p-5 rounded-3xl border border-[#f5d061]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">Club Member Directory</h2>
              <p className="text-xs text-gray-400">Manage member profiles, balances, and permissions</p>
            </div>
            <input
              type="text"
              placeholder="Search member..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="poker-input p-2 text-xs"
            />
          </div>

          <div className="gold-glass p-6 rounded-3xl overflow-x-auto border border-[#f5d061]/30">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f5d061]/20 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">VIP Tier</th>
                  <th className="py-3 px-3">KYC Status</th>
                  <th className="py-3 px-3">Chip Balance</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#181d2c] transition-all">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-[#f5d061]" />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-gray-400">{u.playerCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{u.role}</td>
                    <td className="py-3 px-3 text-[#f5d061] font-bold">{u.membershipTier}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">${u.chipBalance.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setChipModalUser(u)}
                        className="btn-glass-gold text-[11px] px-3 py-1 font-bold"
                      >
                        Adjust Chips
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHIP LEDGER TAB */}
      {activeAdminTab === 'wallet' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gold-glass p-5 rounded-3xl border border-[#f5d061]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">Global Chip Ledger</h2>
              <p className="text-xs text-gray-400">Complete audit trail of player chip balances</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => exportTransactionsPDF(transactions)} className="btn-24k-gold text-xs px-3 py-2">
                <Download className="w-3.5 h-3.5 inline mr-1" /> PDF Export
              </button>
              <button onClick={() => exportTransactionsExcel(transactions)} className="btn-glass-gold text-xs px-3 py-2 font-bold">
                <Download className="w-3.5 h-3.5 inline mr-1" /> Excel Export
              </button>
            </div>
          </div>

          <div className="gold-glass p-6 rounded-3xl overflow-x-auto border border-[#f5d061]/30">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f5d061]/20 text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-3">TXN Code</th>
                  <th className="py-3 px-3">User Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#181d2c] transition-all">
                    <td className="py-3 px-3 font-mono font-bold text-[#f5d061]">{t.txnCode}</td>
                    <td className="py-3 px-3 text-white font-medium">{t.userName}</td>
                    <td className="py-3 px-3 text-gray-300">{t.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">${t.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-gray-400">{t.method || 'SYSTEM'}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{t.status}</td>
                    <td className="py-3 px-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POKER ROOM MANAGEMENT TAB */}
      {activeAdminTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gold-glass p-5 rounded-3xl border border-[#f5d061]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">Poker Rooms & Table Stakes</h2>
              <p className="text-xs text-gray-400">Launch new tables and set blind limits</p>
            </div>
            <button
              onClick={() => setShowCreateTableModal(true)}
              className="btn-24k-gold text-xs px-4 py-2 flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Launch Table
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tables.map((tbl) => (
              <div key={tbl.id} className="gold-glass p-6 rounded-3xl space-y-4 border border-[#f5d061]/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">{tbl.name}</h3>
                    <span className="text-[10px] text-[#f5d061] uppercase font-bold">{tbl.gameType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {tbl.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#050608]/80 p-3 rounded-2xl border border-[#f5d061]/20">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Blinds</span>
                    <strong className="text-[#f5d061] font-mono">${tbl.smallBlind} / ${tbl.bigBlind}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Buy-In Range</span>
                    <strong className="text-white font-mono">${tbl.minBuyIn.toLocaleString()} - ${tbl.maxBuyIn.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Seated Players: <strong>{tbl.seatedPlayers.length} / {tbl.maxSeats}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORTS & COMPLIANCE TAB */}
      {activeAdminTab === 'reports' && (
        <div className="gold-glass p-6 rounded-3xl space-y-4 border border-[#f5d061]/30">
          <h2 className="text-base font-bold text-white font-serif">Compliance & System Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#050608]/80 border border-[#f5d061]/20 space-y-3">
              <h4 className="text-xs font-bold text-white">Transactions Audit Ledger</h4>
              <p className="text-xs text-gray-400">Complete log of deposits and cashouts.</p>
              <div className="flex space-x-2">
                <button onClick={() => exportTransactionsPDF(transactions)} className="btn-24k-gold px-3 py-1.5 text-xs">PDF</button>
                <button onClick={() => exportTransactionsExcel(transactions)} className="btn-glass-gold px-3 py-1.5 text-xs font-bold">Excel</button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#050608]/80 border border-[#f5d061]/20 space-y-3">
              <h4 className="text-xs font-bold text-white">KYC Compliance Report</h4>
              <p className="text-xs text-gray-400">Identity verification records & notes.</p>
              <div className="flex space-x-2">
                <button onClick={() => exportKycReportPDF(kycRecords)} className="btn-24k-gold px-3 py-1.5 text-xs">PDF</button>
                <button onClick={() => exportKycReportExcel(kycRecords)} className="btn-glass-gold px-3 py-1.5 text-xs font-bold">Excel</button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#050608]/80 border border-[#f5d061]/20 space-y-3">
              <h4 className="text-xs font-bold text-white">Chip Circulation Report</h4>
              <p className="text-xs text-gray-400">Summary of total member balances.</p>
              <div className="flex space-x-2">
                <button onClick={() => exportChipCirculationPDF(users)} className="btn-24k-gold px-3 py-1.5 text-xs">PDF</button>
                <button onClick={() => exportChipCirculationExcel(users)} className="btn-glass-gold px-3 py-1.5 text-xs font-bold">Excel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT KYC MODAL */}
      {inspectKyc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="gold-glass-24k p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 border border-[#f5d061] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f5d061]/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-serif">KYC Inspection</h3>
                <p className="text-xs text-gray-300">{inspectKyc.fullName} ({inspectKyc.email})</p>
              </div>
              <button onClick={() => setInspectKyc(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#f5d061]">Submitted ID Document</span>
                <img src={inspectKyc.idDocUrl} alt="" className="w-full h-40 object-cover rounded-2xl border border-[#f5d061]/40" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Verification Selfie</span>
                <img src={inspectKyc.selfieUrl} alt="" className="w-full h-40 object-cover rounded-2xl border border-emerald-500/40" />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  onReviewKyc(inspectKyc.id, 'REJECTED', 'Rejected due to invalid document format.');
                  setInspectKyc(null);
                }}
                className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-xs font-bold"
              >
                Reject KYC
              </button>
              <button
                onClick={() => {
                  onReviewKyc(inspectKyc.id, 'VERIFIED', 'Verified cleanly.');
                  setInspectKyc(null);
                }}
                className="btn-24k-gold px-6 py-2 text-xs font-extrabold shadow-lg"
              >
                Approve Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST CHIPS MODAL */}
      {chipModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="gold-glass-24k p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 border border-[#f5d061]">
            <div className="flex items-center justify-between border-b border-[#f5d061]/20 pb-3">
              <h3 className="text-base font-bold text-white font-serif">Chip Adjustment</h3>
              <button onClick={() => setChipModalUser(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleChipSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-bold">Target Member</label>
                <div className="font-bold text-white">{chipModalUser.name} (${chipModalUser.chipBalance.toLocaleString()})</div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-bold">Chip Amount</label>
                <input
                  type="number"
                  min={100}
                  value={chipModalAmount}
                  onChange={(e) => setChipModalAmount(Number(e.target.value))}
                  className="w-full poker-input p-3 font-bold font-mono text-[#f5d061]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setChipModalUser(null)} className="flex-1 btn-glass-gold py-2.5 text-xs font-bold">Cancel</button>
                <button type="submit" className="flex-1 btn-24k-gold py-2.5 text-xs font-extrabold shadow-lg">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
