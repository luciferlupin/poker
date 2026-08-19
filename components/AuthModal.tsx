'use client';

import React, { useState } from 'react';
import { Phone, Mail, Lock, Key, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { User } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  existingUsers: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  existingUsers,
}) => {
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [phoneInput, setPhoneInput] = useState('+1 (555) 392-0192');
  const [emailInput, setEmailInput] = useState('sophia.r@monaco-holdings.com');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  
  // OTP step
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [otpCode, setOtpCode] = useState('123456');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return alert('Please enter a valid mobile number.');
    setStep('OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456') return alert('Invalid OTP code. Use demo code: 123456');

    // Find or create user
    const matched = existingUsers.find((u) => u.phone === phoneInput) || existingUsers[1] || existingUsers[0];
    onLoginSuccess(matched);
    onClose();
    setStep('CREDENTIALS');
    alert(`Successfully authenticated as ${matched.name} (${matched.playerCode})!`);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = existingUsers.find((u) => u.email === emailInput) || existingUsers[1] || existingUsers[0];
    onLoginSuccess(matched);
    onClose();
    alert(`Successfully authenticated as ${matched.name} (${matched.playerCode})!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="red-glass-bright p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 border border-[#ff2d55]/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#ff2d55]/20 border border-[#ff2d55]/40 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#ff2d55]" />
          </div>
          <h3 className="text-lg font-bold text-white font-serif">Member Portal Authentication</h3>
          <p className="text-xs text-gray-400">Secure entry for verified private club members</p>
        </div>

        {/* Tab Switcher */}
        <div className="apple-segmented-bar flex items-center p-1 bg-black/60 border border-white/10 rounded-2xl">
          <button
            onClick={() => {
              setAuthMethod('PHONE');
              setStep('CREDENTIALS');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMethod === 'PHONE' ? 'btn-red-pill text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mobile + OTP
          </button>
          <button
            onClick={() => {
              setAuthMethod('EMAIL');
              setStep('CREDENTIALS');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMethod === 'EMAIL' ? 'btn-red-pill text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Email + Password
          </button>
        </div>

        {authMethod === 'PHONE' ? (
          step === 'CREDENTIALS' ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-bold">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full red-input p-3 pl-10 text-xs"
                  />
                </div>
              </div>

              <button type="submit" className="w-full btn-red-pill py-3 text-xs font-bold flex items-center justify-center space-x-2">
                <span>Send 6-Digit OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] text-gray-400 block">OTP Sent To:</span>
                <strong className="text-white font-mono text-xs">{phoneInput}</strong>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-bold">Enter 6-Digit Verification Code</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#ff2d55] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full red-input p-3 pl-10 text-lg font-bold font-mono text-[#ff2d55] text-center tracking-widest"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block text-center">Demo Verification Code: <strong>123456</strong></span>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setStep('CREDENTIALS')}
                  className="flex-1 btn-glass-red py-2.5 text-xs font-bold"
                >
                  Back
                </button>
                <button type="submit" className="flex-1 btn-red-pill py-2.5 text-xs font-bold">
                  Verify & Log In
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-300 block mb-1 font-bold">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full red-input p-3 pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-bold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full red-input p-3 pl-10 text-xs"
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-red-pill py-3 text-xs font-bold flex items-center justify-center space-x-2">
              <span>Log In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
