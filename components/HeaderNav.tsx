'use client';

import React, { useState } from 'react';
import {
  Crown,
  Coins,
  Bell,
  ChevronDown,
  Mail,
  MessageSquare,
  Sparkles,
  LogIn,
  LogOut,
} from 'lucide-react';
import { User, NotificationItem } from '@/lib/types';

interface HeaderNavProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  notifications: NotificationItem[];
  currentRole: 'MEMBER' | 'ADMIN';
  onToggleRole: (role: 'MEMBER' | 'ADMIN') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  notifications,
  currentRole,
  onToggleRole,
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const userNotifs = notifications.filter(
    (n) => n.userId === currentUser.id || currentRole === 'ADMIN'
  );
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 px-4 lg:px-8 py-3 bg-black/80 backdrop-blur-3xl border-b border-[#ff2d55]/25 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff375f] via-[#ff2d55] to-[#e50914] p-0.5 shadow-lg shadow-[#ff2d55]/40 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#000000] rounded-[14px] flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#ff2d55]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-white font-sans">
                Monaco Royal
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff2d55]/15 text-[#ff2d55] font-bold border border-[#ff2d55]/30 tracking-wider">
                INDIA VIP
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider">Indian Private Poker Club OS</p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Indian Rupee Chip Balance Pill */}
          <div className="hidden sm:flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#0e0e14] border border-[#ff2d55]/40 shadow-inner">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#ff375f] to-[#e50914] flex items-center justify-center shadow">
              <Coins className="w-3 h-3 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">Chips</span>
              <span className="text-xs font-bold font-mono text-[#ff2d55]">
                ₹{currentUser.chipBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Apple Segmented Switcher */}
          <div className="apple-segmented-bar flex items-center border border-[#ff2d55]/30">
            <button
              onClick={() => onToggleRole('MEMBER')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                currentRole === 'MEMBER'
                  ? 'btn-red-pill text-white shadow-md shadow-[#ff2d55]/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Member Portal
            </button>
            <button
              onClick={() => onToggleRole('ADMIN')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                currentRole === 'ADMIN'
                  ? 'bg-white/20 text-white border border-white/30 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Admin Dashboard
            </button>
          </div>

          {/* Notifications Log */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2.5 rounded-xl bg-[#0e0e14] border border-[#ff2d55]/30 text-gray-300 hover:text-[#ff2d55] hover:border-[#ff2d55] transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff2d55] text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 red-glass-bright p-4 z-50 shadow-2xl rounded-2xl border border-[#ff2d55]/40">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#ff2d55]" />
                    <h4 className="text-xs font-bold text-white">Notifications Feed</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff2d55]/20 text-[#ff2d55] font-bold">
                    {userNotifs.length} total
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto py-2 space-y-2 mt-2">
                  {userNotifs.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No notifications at present.</p>
                  ) : (
                    userNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl text-xs transition-all ${
                          n.read
                            ? 'bg-white/5 border border-white/5 text-gray-400'
                            : 'bg-white/10 border border-[#ff2d55]/30 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#ff2d55] flex items-center gap-1.5">
                            {n.channel === 'EMAIL' && <Mail className="w-3 h-3 text-blue-400" />}
                            {n.channel === 'WHATSAPP' && <MessageSquare className="w-3 h-3 text-emerald-400" />}
                            {n.channel === 'PUSH' && <Bell className="w-3 h-3 text-[#ff2d55]" />}
                            {n.title}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-gray-300">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Switcher */}
          <div className="relative flex items-center space-x-2">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-1 pr-2.5 rounded-full bg-[#0e0e14] border border-[#ff2d55]/40 hover:border-[#ff2d55] transition-all"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-[#ff2d55]"
              />
              <span className="hidden md:inline text-xs font-semibold text-white">{currentUser.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <button
              onClick={onOpenAuth}
              className="btn-glass-red p-2 text-xs font-bold flex items-center space-x-1"
              title="Authenticate / Sign In"
            >
              <LogIn className="w-3.5 h-3.5 text-[#ff2d55]" />
              <span className="hidden lg:inline text-[11px]">Sign In</span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 top-12 w-64 red-glass p-3 z-50 shadow-2xl rounded-2xl border border-[#ff2d55]/40">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2 px-2">
                  Switch Indian Member Account
                </p>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        u.id === currentUser.id
                          ? 'bg-[#ff2d55]/20 border border-[#ff2d55]/40 text-[#ff2d55]'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <img src={u.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="" />
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-[9px] text-gray-400">{u.role} • {u.kycStatus}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#ff2d55] font-mono">₹{(u.chipBalance / 100000).toFixed(1)}L</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
