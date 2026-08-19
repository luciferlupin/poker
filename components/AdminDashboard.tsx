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
  const [chipModalAmount, setChipModalAmount] = useState<number>(500000);
  const [chipModalIsCredit, setChipModalIsCredit] = useState<boolean>(true);
  const [chipModalNotes, setChipModalNotes] = useState<string>('');

  const [showCreateTableModal, setShowCreateTableModal] = useState<boolean>(false);
  const [newTableForm, setNewTableForm] = useState({
    name: 'Goa Offshore High Stakes Hold\'em',
    gameType: 'TEXAS_HOLDEM' as any,
    minBuyIn: 100000,
    maxBuyIn: 1000000,
    smallBlind: 1000,
    bigBlind: 2000,
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
    { day: 'Mon', volume: 1200000, chips: 4500000 },
    { day: 'Tue', volume: 1800000, chips: 4800000 },
    { day: 'Wed', volume: 2400000, chips: 5200000 },
    { day: 'Thu', volume: 2100000, chips: 5900000 },
    { day: 'Fri', volume: 3800000, chips: 6400000 },
    { day: 'Sat', volume: 5100000, chips: 7200000 },
    { day: 'Sun', volume: 4900000, chips: 7800000 },
  ];

  const pieColors = ['#ff2d55', '#ff375f', '#e50914', '#b30012'];
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
    alert(`Successfully ${chipModalIsCredit ? 'credited' : 'deducted'} ₹${chipModalAmount.toLocaleString('en-IN')} chips for ${chipModalUser.name}`);
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
      {/* Admin Red Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-[#ff2d55]/25">
        {[
          { id: 'analytics', label: 'Executive Analytics', icon: TrendingUp },
          { id: 'kyc', label: 'Aadhaar / PAN Queue', icon: ShieldCheck, badge: kycRecords.filter((k) => k.status === 'PENDING').length },
          { id: 'users', label: 'Member Directory', icon: Users },
          { id: 'wallet', label: 'Rupee Ledger', icon: Coins },
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
                  ? 'btn-red-pill text-white shadow-lg shadow-[#ff2d55]/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#ff2d55] text-white font-extrabold text-[9px]">
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
            <div className="red-glass p-5 rounded-3xl space-y-2 border border-[#ff2d55]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Total Club Members</span>
                <Users className="w-4 h-4 text-[#ff2d55]" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{analytics.totalMembers}</div>
              <div className="text-[10px] text-emerald-400 font-bold">
                {analytics.verifiedMembers} Verified ({((analytics.verifiedMembers / analytics.totalMembers) * 100).toFixed(0)}%)
              </div>
            </div>

            <div className="red-glass p-5 rounded-3xl space-y-2 border border-[#ff2d55]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Pending Aadhaar/PAN</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">{analytics.pendingKyc}</div>
              <p className="text-[10px] text-gray-400">Under review in queue</p>
            </div>

            <div className="red-glass p-5 rounded-3xl space-y-2 border border-[#ff2d55]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Chips Circulation (INR)</span>
                <Coins className="w-4 h-4 text-[#ff2d55]" />
              </div>
              <div className="text-3xl font-extrabold text-[#ff2d55] font-mono">
                ₹{(analytics.totalChipsCirculation / 100000).toFixed(1)} Lakh
              </div>
              <p className="text-[10px] text-gray-400">Total player balance</p>
            </div>

            <div className="red-glass p-5 rounded-3xl space-y-2 border border-[#ff2d55]/30">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Monthly Revenue (INR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                ₹{analytics.monthlyRevenue.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-gray-400">VIP Subscription dues</p>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 red-glass p-6 rounded-3xl space-y-4 border border-[#ff2d55]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-serif">7-Day Chip Circulation & Rupee Volume</h3>
                  <p className="text-xs text-gray-400">Throughput transaction analysis</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#ff2d55]/20 text-[#ff2d55] font-mono font-bold">
                  Weekly
                </span>
              </div>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartLineData}>
                    <XAxis dataKey="day" stroke="#686873" fontSize={11} />
                    <YAxis stroke="#686873" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000', borderColor: '#ff2d55', borderRadius: '14px' }}
                      labelStyle={{ color: '#ff2d55', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="chips" stroke="#ff2d55" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="volume" stroke="#ffffff" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="red-glass p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-[#ff2d55]/30">
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
                    <Tooltip contentStyle={{ backgroundColor: '#000000', borderColor: '#ff2d55' }} />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 red-glass p-5 rounded-3xl border border-[#ff2d55]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">Aadhaar & PAN KYC Queue</h2>
              <p className="text-xs text-gray-400">Inspect submitted identity documents and selfies</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search member..."
                value={kycSearch}
                onChange={(e) => setKycSearch(e.target.value)}
                className="red-input p-2 text-xs"
              />
              <select
                value={kycFilterStatus}
                onChange={(e) => setKycFilterStatus(e.target.value)}
                className="red-input p-2 text-xs font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="red-glass p-6 rounded-3xl overflow-x-auto border border-[#ff2d55]/30">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ff2d55]/20 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Applicant Name</th>
                  <th className="py-3 px-3">Gov ID Type</th>
                  <th className="py-3 px-3">ID Number</th>
                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredKyc.map((k) => (
                  <tr key={k.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{k.fullName}</div>
                      <div className="text-[10px] text-gray-400">{k.email}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-mono">{k.govIdType}</td>
                    <td className="py-3 px-3 text-gray-300 font-mono">{k.govIdNumber}</td>
                    <td className="py-3 px-3 text-gray-300">{k.city}</td>
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
                        className="btn-red-pill text-[11px] px-3 py-1.5 flex items-center gap-1 ml-auto shadow-md"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 red-glass p-5 rounded-3xl border border-[#ff2d55]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">Indian Member Directory</h2>
              <p className="text-xs text-gray-400">Manage member profiles, Rupee balances, and permissions</p>
            </div>
            <input
              type="text"
              placeholder="Search member..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="red-input p-2 text-xs"
            />
          </div>

          <div className="red-glass p-6 rounded-3xl overflow-x-auto border border-[#ff2d55]/30">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ff2d55]/20 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">VIP Tier</th>
                  <th className="py-3 px-3">KYC Status</th>
                  <th className="py-3 px-3">Chip Balance (INR)</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-[#ff2d55]" />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-gray-400">{u.playerCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{u.role}</td>
                    <td className="py-3 px-3 text-[#ff2d55] font-bold">{u.membershipTier}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">₹{u.chipBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setChipModalUser(u)}
                        className="btn-glass-red text-[11px] px-3 py-1 font-bold"
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
          <div className="flex items-center justify-between red-glass p-5 rounded-3xl border border-[#ff2d55]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">Rupee Chip Ledger</h2>
              <p className="text-xs text-gray-400">Complete audit trail of player chip balances</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => exportTransactionsPDF(transactions)} className="btn-red-pill text-xs px-3 py-2">
                <Download className="w-3.5 h-3.5 inline mr-1" /> PDF Export
              </button>
              <button onClick={() => exportTransactionsExcel(transactions)} className="btn-glass-red text-xs px-3 py-2 font-bold">
                <Download className="w-3.5 h-3.5 inline mr-1" /> Excel Export
              </button>
            </div>
          </div>

          <div className="red-glass p-6 rounded-3xl overflow-x-auto border border-[#ff2d55]/30">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ff2d55]/20 text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-3">TXN Code</th>
                  <th className="py-3 px-3">User Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount (INR)</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 px-3 font-mono font-bold text-[#ff2d55]">{t.txnCode}</td>
                    <td className="py-3 px-3 text-white font-medium">{t.userName}</td>
                    <td className="py-3 px-3 text-gray-300">{t.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">₹{t.amount.toLocaleString('en-IN')}</td>
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
          <div className="flex items-center justify-between red-glass p-5 rounded-3xl border border-[#ff2d55]/30">
            <div>
              <h2 className="text-base font-bold text-white font-serif">Indian Poker Rooms & Stakes</h2>
              <p className="text-xs text-gray-400">Launch new tables and set blind limits</p>
            </div>
            <button
              onClick={() => setShowCreateTableModal(true)}
              className="btn-red-pill text-xs px-4 py-2 flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Launch Table
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tables.map((tbl) => (
              <div key={tbl.id} className="red-glass p-6 rounded-3xl space-y-4 border border-[#ff2d55]/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">{tbl.name}</h3>
                    <span className="text-[10px] text-[#ff2d55] uppercase font-bold">{tbl.gameType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {tbl.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#000000]/80 p-3 rounded-2xl border border-[#ff2d55]/20">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Blinds</span>
                    <strong className="text-[#ff2d55] font-mono">₹{tbl.smallBlind.toLocaleString('en-IN')} / ₹{tbl.bigBlind.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Buy-In Range</span>
                    <strong className="text-white font-mono">₹{tbl.minBuyIn.toLocaleString('en-IN')} - ₹{tbl.maxBuyIn.toLocaleString('en-IN')}</strong>
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
        <div className="red-glass p-6 rounded-3xl space-y-4 border border-[#ff2d55]/30">
          <h2 className="text-base font-bold text-white font-serif">Compliance & System Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#000000]/80 border border-[#ff2d55]/20 space-y-3">
              <h4 className="text-xs font-bold text-white">Transactions Audit Ledger</h4>
              <p className="text-xs text-gray-400">Complete log of deposits and cashouts.</p>
              <div className="flex space-x-2">
                <button onClick={() => exportTransactionsPDF(transactions)} className="btn-red-pill px-3 py-1.5 text-xs">PDF</button>
                <button onClick={() => exportTransactionsExcel(transactions)} className="btn-glass-red px-3 py-1.5 text-xs font-bold">Excel</button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#000000]/80 border border-[#ff2d55]/20 space-y-3">
              <h4 className="text-xs font-bold text-white">Aadhaar/PAN Compliance Report</h4>
              <p className="text-xs text-gray-400">Identity verification records & notes.</p>
              <div className="flex space-x-2">
                <button onClick={() => exportKycReportPDF(kycRecords)} className="btn-red-pill px-3 py-1.5 text-xs">PDF</button>
                <button onClick={() => exportKycReportExcel(kycRecords)} className="btn-glass-red px-3 py-1.5 text-xs font-bold">Excel</button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#000000]/80 border border-[#ff2d55]/20 space-y-3">
              <h4 className="text-xs font-bold text-white">Chip Circulation Report</h4>
              <p className="text-xs text-gray-400">Summary of total member Rupee balances.</p>
              <div className="flex space-x-2">
                <button onClick={() => exportChipCirculationPDF(users)} className="btn-red-pill px-3 py-1.5 text-xs">PDF</button>
                <button onClick={() => exportChipCirculationExcel(users)} className="btn-glass-red px-3 py-1.5 text-xs font-bold">Excel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT KYC MODAL */}
      {inspectKyc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="red-glass-bright p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 border border-[#ff2d55] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ff2d55]/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-serif">Aadhaar / PAN Inspection</h3>
                <p className="text-xs text-gray-300">{inspectKyc.fullName} ({inspectKyc.email})</p>
              </div>
              <button onClick={() => setInspectKyc(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#ff2d55]">Submitted ID ({inspectKyc.govIdType})</span>
                <img src={inspectKyc.idDocUrl} alt="" className="w-full h-40 object-cover rounded-2xl border border-[#ff2d55]/40" />
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
                className="btn-red-pill px-6 py-2 text-xs font-extrabold shadow-lg"
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
          <div className="red-glass-bright p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 border border-[#ff2d55]">
            <div className="flex items-center justify-between border-b border-[#ff2d55]/20 pb-3">
              <h3 className="text-base font-bold text-white font-serif">Rupee Chip Adjustment</h3>
              <button onClick={() => setChipModalUser(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleChipSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-bold">Target Member</label>
                <div className="font-bold text-white">{chipModalUser.name} (₹{chipModalUser.chipBalance.toLocaleString('en-IN')})</div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-bold">Chip Amount (INR)</label>
                <input
                  type="number"
                  min={10000}
                  step={50000}
                  value={chipModalAmount}
                  onChange={(e) => setChipModalAmount(Number(e.target.value))}
                  className="w-full red-input p-3 font-bold font-mono text-[#ff2d55]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setChipModalUser(null)} className="flex-1 btn-glass-red py-2.5 text-xs font-bold">Cancel</button>
                <button type="submit" className="flex-1 btn-red-pill py-2.5 text-xs font-extrabold shadow-lg">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
