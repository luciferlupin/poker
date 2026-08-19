'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, Camera, Send, Check, ArrowRight } from 'lucide-react';
import { User, KycRecord } from '@/lib/types';

interface OnboardingWizardProps {
  currentUser: User;
  onCompleteWizard: (formData: Partial<KycRecord>) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentUser,
  onCompleteWizard,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [form, setForm] = useState({
    fullName: currentUser.name || '',
    dob: '1988-07-14',
    gender: 'MALE' as const,
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    address: '14 Marine Drive Penthouse',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    govIdType: 'AADHAAR' as const,
    govIdNumber: '9928-1102-4491',
    idDocUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
    selfieUrl: currentUser.avatarUrl,
    emergencyContactName: 'Priya Oberoi',
    emergencyContactPhone: '+91 98111 22335',
    referralSource: 'Vikramaditya Singhania',
  });

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, idDocUrl: URL.createObjectURL(file) });
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, selfieUrl: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompleteWizard(form);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#ff2d55]/20 border border-[#ff2d55]/40 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6 text-[#ff2d55]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
          Indian Member Aadhaar & PAN KYC Onboarding
        </h1>
        <p className="text-xs text-gray-400 max-w-lg mx-auto">
          Welcome to Monaco Royal India VIP Club. Complete your profile and identity verification below to unlock full access to the high-stakes poker dashboard.
        </p>
      </div>

      {/* Wizard Progress Steps Indicator */}
      <div className="flex items-center justify-between apple-glass p-4 rounded-2xl border border-[#ff2d55]/30">
        {[
          { num: 1, label: 'Personal Info' },
          { num: 2, label: 'Aadhaar / PAN & Selfie' },
          { num: 3, label: 'Emergency Contact' },
        ].map((s) => (
          <div key={s.num} className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                step === s.num
                  ? 'btn-red-pill text-white shadow-lg shadow-[#ff2d55]/40'
                  : step > s.num
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === s.num ? 'text-white' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Form Wizard Cards */}
      <form onSubmit={handleSubmit} className="red-glass-bright p-6 sm:p-8 rounded-3xl space-y-6 border border-[#ff2d55]/40">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#ff2d55] border-b border-white/10 pb-2">
              Step 1: Personal Profile Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Mobile Number (+91)</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">State</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-red-pill px-6 py-2.5 text-xs font-bold flex items-center space-x-1"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#ff2d55] border-b border-white/10 pb-2">
              Step 2: Aadhaar Card / PAN Card & Live Selfie
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Gov ID Type</label>
                <select
                  value={form.govIdType}
                  onChange={(e) => setForm({ ...form, govIdType: e.target.value as any })}
                  className="w-full red-input p-3 font-bold"
                >
                  <option value="AADHAAR">Aadhaar Card (12-Digit)</option>
                  <option value="PAN_CARD">PAN Card (10-Digit Alphanumeric)</option>
                  <option value="DRIVING_LICENSE">Indian Driving Licence</option>
                  <option value="PASSPORT">Indian Passport</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Aadhaar / PAN Serial Number</label>
                <input
                  type="text"
                  required
                  value={form.govIdNumber}
                  onChange={(e) => setForm({ ...form, govIdNumber: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>

              {/* ID Upload */}
              <div className="p-4 rounded-2xl bg-black/80 border border-dashed border-[#ff2d55]/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {form.idDocUrl ? (
                  <div className="w-full space-y-2">
                    <img src={form.idDocUrl} alt="ID Preview" className="w-full h-32 object-cover rounded-xl border border-[#ff2d55]/40" />
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
                <input type="file" accept="image/*" onChange={handleIdUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              {/* Selfie Upload */}
              <div className="p-4 rounded-2xl bg-black/80 border border-dashed border-[#ff2d55]/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {form.selfieUrl ? (
                  <div className="w-full space-y-2">
                    <img src={form.selfieUrl} alt="Selfie Preview" className="w-full h-32 object-cover rounded-xl border border-emerald-500/40" />
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Verification Selfie Attached
                    </span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-emerald-400 mb-2" />
                    <span className="text-xs font-bold text-white">Upload Verification Selfie</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleSelfieUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-glass-red px-6 py-2.5 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-red-pill px-6 py-2.5 text-xs font-bold flex items-center space-x-1"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#ff2d55] border-b border-white/10 pb-2">
              Step 3: Emergency Contact & Sponsor Referral
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  required
                  value={form.emergencyContactName}
                  onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Emergency Contact Phone (+91)</label>
                <input
                  type="text"
                  required
                  value={form.emergencyContactPhone}
                  onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-gray-400 block mb-1">Sponsor / Member Referral</label>
                <input
                  type="text"
                  value={form.referralSource}
                  onChange={(e) => setForm({ ...form, referralSource: e.target.value })}
                  className="w-full red-input p-3"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-glass-red px-6 py-2.5 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-red-pill px-8 py-3 text-xs font-extrabold flex items-center space-x-2 shadow-xl"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Unlock Poker Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
