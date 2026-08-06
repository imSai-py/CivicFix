import React, { useState, useEffect, useRef } from 'react';
import { Shield, LogOut, CheckCircle2, AlertCircle, Trophy, Sparkles, Zap, Flame, Camera, RefreshCw, User, Phone, Mail, Save, History, Info, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, issuesApi, getAttachmentUrl } from '../services/api';
import { Issue } from '../types';
import { IssueCard } from '../components/IssueCard';

interface ProfilePageProps {
  onSwitchToLogin: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSwitchToLogin }) => {
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'security'>('info');

  // Personal Details Form State
  const [fullNameInput, setFullNameInput] = useState(user?.full_name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone_number || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security & Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Avatar Photo Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Report History State
  const [myReports, setMyReports] = useState<Issue[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // XP Rules Info Modal State
  const [showXpRules, setShowXpRules] = useState(false);

  useEffect(() => {
    if (user) {
      setFullNameInput(user.full_name || '');
      setPhoneInput(user.phone_number || '');
    }
  }, [user]);

  // Load User's Report History
  const fetchMyReports = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const res = await issuesApi.list({ limit: 100 });
      const items = res.data.items || [];
      const userIssues = items.filter((i) => i.reporter_id === user.id);
      setMyReports(userIssues);
    } catch (err) {
      console.error('Failed to load user report history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyReports();
    }
  }, [activeTab]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#0e101d] rounded-3xl p-8 text-center space-y-4 border border-[#00ffcc]/30 shadow-[0_0_25px_rgba(0,255,204,0.2)]">
        <Shield className="w-12 h-12 text-[#00ffcc] mx-auto neon-text-secondary" />
        <h2 className="font-headline font-bold text-xl text-white">Authentication Required</h2>
        <p className="font-body text-xs text-slate-400">Log in to view your profile and manage issue submissions.</p>
        <button
          onClick={onSwitchToLogin}
          className="font-label text-xs uppercase tracking-wider px-6 py-3 rounded-2xl bg-[#ff2d78] text-white font-bold transition-all shadow-[0_0_15px_#ff2d78]"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      await authApi.uploadAvatar(file);
      await refreshUser();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      await authApi.updateProfile({
        full_name: fullNameInput,
        phone_number: phoneInput,
      });
      await refreshUser();
      setProfileMessage({ type: 'success', text: 'Personal details updated successfully!' });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to update personal details.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      await authApi.changePassword({ current_password: oldPassword, new_password: newPassword });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 4000);
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to update password.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const xp = user.xp_points || 0;
  const rank = user.reputation_rank || 'Civic Watcher';
  const nextTargetXP = xp < 50 ? 50 : xp < 200 ? 200 : 500;
  const xpPercent = Math.min(100, Math.round((xp / nextTargetXP) * 100));
  const avatarSrc = user.avatar_url ? getAttachmentUrl(user.avatar_url) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 my-6 px-1 sm:px-0">
      {/* Profile Header with Interactive Avatar Upload */}
      <div className="bg-[#0e101d] rounded-3xl p-6 border border-[#00ffcc]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_20px_rgba(0,255,204,0.15)]">
        <div className="flex items-center space-x-5">
          {/* Avatar Container with Camera Trigger Badge */}
          <div className="relative group/avatar">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#00ffcc] shadow-[0_0_20px_rgba(0,255,204,0.4)] group-hover/avatar:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#141629] border-2 border-[#ff2d78] flex items-center justify-center text-[#ff2d78] text-3xl font-headline font-bold shadow-[0_0_20px_rgba(255,45,120,0.6)] group-hover/avatar:scale-105 transition-transform duration-300">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Camera Upload Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-[#ff2d78] text-white border border-white/20 shadow-[0_0_12px_rgba(255,45,120,0.8)] hover:scale-110 active:scale-95 transition-all hover:bg-[#00ffcc] hover:text-slate-950"
              title="Upload / Change Profile Avatar Photo"
            >
              {isUploadingAvatar ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="font-headline font-bold text-2xl text-white">{user.full_name}</h1>
              <span className="font-label text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40">
                {user.role}
              </span>
            </div>
            <p className="font-body text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 font-label text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl bg-[#141629] hover:bg-rose-500/20 text-rose-400 border border-[#232745] hover:border-rose-500/40 transition-all font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* SLEEK COMPACT GAMIFICATION XP BAR (Conserves Vertical Space) */}
      <div className="relative rounded-2xl p-4 overflow-hidden bg-gradient-to-r from-[#121226] via-[#0f172a] to-[#1e1432] border border-[#00ffcc]/40 shadow-[0_0_20px_rgba(0,255,204,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Rank Title & Badge */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-[#00ffcc]/15 border border-[#00ffcc]/40 shadow-[0_0_10px_#00ffcc]">
            <Trophy className="w-5 h-5 text-[#ffe04a]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-headline font-bold text-sm text-white">{rank}</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <span className="font-label text-[10px] uppercase font-bold text-[#00ffcc]">
              Level {xp >= 500 ? '4 (Max)' : xp >= 200 ? '3' : xp >= 50 ? '2' : '1'}
            </span>
          </div>
        </div>

        {/* Center: Sleek Progress Line */}
        <div className="flex-1 w-full space-y-1">
          <div className="flex justify-between items-center text-[10px] font-label font-bold">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#ffe04a]" /> Rank Progress
            </span>
            <span className="text-[#00ffcc] font-mono">{xp} / {nextTargetXP} XP</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-[#00ffcc]/30 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#00ffcc] via-[#ffe04a] to-[#ff2d78] rounded-full transition-all duration-700 relative shadow-[0_0_10px_#00ffcc]"
              style={{ width: `${xpPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep"></div>
            </div>
          </div>
        </div>

        {/* Right: XP Score Badge & Info Tooltip Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1 rounded-xl bg-[#00ffcc]/10 border border-[#00ffcc]/40 font-headline font-black text-sm text-[#00ffcc]">
            {xp} XP
          </span>
          <button
            onClick={() => setShowXpRules(!showXpRules)}
            className="p-1.5 rounded-xl bg-[#141629] text-slate-400 hover:text-[#00ffcc] border border-[#232745] transition-colors"
            title="How to earn XP"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* XP Rules Info Modal */}
      {showXpRules && (
        <div className="bg-[#0e101d] p-4 rounded-2xl border border-[#ffe04a]/40 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center">
            <span className="font-label text-xs uppercase font-bold text-[#ffe04a] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffe04a]" /> How to Earn XP Points
            </span>
            <button onClick={() => setShowXpRules(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-body pt-1">
            <div className="p-2.5 rounded-xl bg-[#141629] border border-[#00ffcc]/30 text-slate-300">
              <span className="font-bold text-[#00ffcc] block">+25 XP</span> Create a new report
            </div>
            <div className="p-2.5 rounded-xl bg-[#141629] border border-emerald-500/30 text-slate-300">
              <span className="font-bold text-emerald-400 block">+50 XP</span> Issue fixed by crew
            </div>
            <div className="p-2.5 rounded-xl bg-[#141629] border border-[#ffe04a]/30 text-slate-300">
              <span className="font-bold text-[#ffe04a] block">+25 XP</span> Rate repair feedback
            </div>
          </div>
        </div>
      )}

      {/* 3 TAB SWITCHER */}
      <div className="flex border-b border-[#1b1e34] font-label text-xs uppercase tracking-wider font-bold space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'info'
              ? 'border-[#00ffcc] text-[#00ffcc] neon-text-secondary'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history'
              ? 'border-[#00ffcc] text-[#00ffcc] neon-text-secondary'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Report History ({myReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'security'
              ? 'border-[#ff2d78] text-[#ff2d78] neon-text-primary'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* TAB 1: PERSONAL DETAILS (Interactive Edit Name & Phone) */}
      {activeTab === 'info' && (
        <div className="bg-[#0e101d] rounded-3xl p-6 border border-[#1b1e34] space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg text-white">Edit Personal Information</h3>
            <span className="font-label text-[10px] uppercase font-bold text-[#00ffcc] px-2.5 py-0.5 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30">
              Active Citizen Profile
            </span>
          </div>

          {profileMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00ffcc]" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc] transition-all"
              />
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00ffcc]" /> Phone Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc] transition-all"
              />
            </div>

            {/* Email Address (Read-Only) */}
            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
                </span>
                <span className="text-[10px] text-emerald-400 font-normal">Verified Account</span>
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-[#0c0c18] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed opacity-75"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3.5 rounded-2xl bg-[#00ffcc] text-slate-950 font-headline font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_20px_#00ffcc] disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>{isSavingProfile ? 'Saving Details...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REPORT HISTORY (History of Reported Issues) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#00ffcc]" /> My Reported Issues ({myReports.length})
            </h3>
            <button
              onClick={fetchMyReports}
              disabled={isLoadingHistory}
              className="p-2 rounded-xl bg-[#101222] border border-[#1b1e36] text-slate-300 hover:text-[#00ffcc] transition-all"
              title="Refresh report history"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="bg-[#0e101d] rounded-2xl h-48 animate-pulse border border-[#1b1e34]"></div>
              ))}
            </div>
          ) : myReports.length === 0 ? (
            <div className="bg-[#0e101d] rounded-3xl p-10 text-center text-slate-400 space-y-3 border border-[#00ffcc]/30">
              <Clock className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="font-headline font-bold text-base text-white">No Reports Submitted Yet</p>
              <p className="font-body text-xs text-slate-400">You haven't filed any civic hazard reports under this account.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReports.map((report) => (
                <IssueCard
                  key={report.id}
                  issue={report}
                  isAuthenticated={isAuthenticated}
                  onRefresh={fetchMyReports}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="bg-[#0e101d] rounded-3xl p-6 border border-[#ff2d78]/30 space-y-4 max-w-md shadow-2xl">
          <h3 className="font-headline font-bold text-lg text-white">Change Password</h3>

          {passwordMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                passwordMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {passwordMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-[#141629] border border-[#232745] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00ffcc]"
              />
            </div>

            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#141629] border border-[#232745] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00ffcc]"
              />
            </div>

            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#141629] border border-[#232745] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00ffcc]"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3.5 rounded-2xl bg-[#ff2d78] text-white font-label text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_15px_#ff2d78] disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
