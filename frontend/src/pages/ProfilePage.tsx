import React, { useState, useRef } from 'react';
import { Shield, LogOut, CheckCircle2, AlertCircle, Award, Trophy, Sparkles, Zap, Flame, Star, CheckCircle, FileText, Camera, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, getAttachmentUrl } from '../services/api';

interface ProfilePageProps {
  onSwitchToLogin: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSwitchToLogin }) => {
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Avatar Photo Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-surface-container rounded-3xl p-8 text-center space-y-4 border border-secondary/30 neon-border-secondary">
        <Shield className="w-12 h-12 text-secondary mx-auto neon-text-secondary" />
        <h2 className="font-headline font-bold text-xl text-on-surface">Authentication Required</h2>
        <p className="font-body text-xs text-on-surface-variant">Log in to view your profile and manage issue submissions.</p>
        <button
          onClick={onSwitchToLogin}
          className="font-label text-xs uppercase tracking-wider px-6 py-3 rounded-xl bg-primary text-white font-bold transition-all shadow-[0_0_15px_rgba(255,45,120,0.4)] neon-btn-glow"
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
    <div className="max-w-3xl mx-auto space-y-8 my-6">
      {/* Profile Header with Interactive Avatar Upload */}
      <div className="bg-surface-container rounded-3xl p-6 border border-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_20px_rgba(0,255,204,0.1)]">
        <div className="flex items-center space-x-5">
          {/* Avatar Container with Camera Trigger Badge */}
          <div className="relative group/avatar">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-secondary shadow-[0_0_20px_rgba(0,255,204,0.4)] group-hover/avatar:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-surface-dim border-2 border-primary flex items-center justify-center text-primary text-3xl font-headline font-bold shadow-[0_0_20px_rgba(255,45,120,0.6)] group-hover/avatar:scale-105 transition-transform duration-300">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Camera Upload Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-primary text-white border border-white/20 shadow-[0_0_12px_rgba(255,45,120,0.8)] hover:scale-110 active:scale-95 transition-all hover:bg-secondary hover:text-slate-950"
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
              <h1 className="font-headline font-bold text-2xl text-on-surface">{user.full_name}</h1>
              <span className="font-label text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/40">
                {user.role}
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">{user.email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-label text-[10px] text-secondary hover:underline uppercase tracking-wider font-bold mt-1 inline-flex items-center gap-1"
            >
              <Camera className="w-3 h-3" /> Change Profile Picture
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 font-label text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-rose-500/20 text-rose-400 border border-outline/30 hover:border-rose-500/40 transition-all font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* MAGNIFICENT CYBERPUNK GAMIFICATION XP CARD */}
      <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#121226] via-[#0f172a] to-[#1e1432] border border-[#00ffcc]/50 shadow-[0_0_40px_rgba(0,255,204,0.25)] space-y-6">
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00ffcc]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#ff2d78]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Rank Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#00ffcc]/20 to-[#ff2d78]/20 border border-[#00ffcc]/50 shadow-[0_0_20px_rgba(0,255,204,0.4)] animate-pulse">
              <Trophy className="w-7 h-7 text-[#ffe04a] drop-shadow-[0_0_10px_rgba(255,224,74,1)]" />
            </div>
            <div>
              <span className="font-label text-[10px] uppercase font-extrabold tracking-widest text-[#00ffcc] block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ffe04a]" /> Civic Reputation & Rank
              </span>
              <h2 className="font-headline font-black text-2xl text-white flex items-center space-x-2 tracking-wide">
                <span className="bg-gradient-to-r from-white via-slate-100 to-[#ffe04a] bg-clip-text text-transparent">
                  {rank}
                </span>
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
              </h2>
            </div>
          </div>

          <div className="text-right">
            <div className="font-headline font-black text-3xl text-[#00ffcc] drop-shadow-[0_0_12px_rgba(0,255,204,0.8)]">
              {xp} <span className="text-sm font-label text-slate-300">XP</span>
            </div>
            <span className="font-label text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/30 font-bold inline-block mt-1">
              Level {xp >= 500 ? '4 (Max)' : xp >= 200 ? '3' : xp >= 50 ? '2' : '1'}
            </span>
          </div>
        </div>

        {/* Dynamic XP Progress Bar */}
        <div className="space-y-2 relative z-10 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-center text-xs font-label font-bold">
            <span className="text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#ffe04a]" /> Progress to Next Rank
            </span>
            <span className="text-[#00ffcc] font-mono text-xs">{xp} / {nextTargetXP} XP ({xpPercent}%)</span>
          </div>

          <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-[#00ffcc]/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
            <div
              className="h-full bg-gradient-to-r from-[#00ffcc] via-[#ffe04a] to-[#ff2d78] rounded-full transition-all duration-1000 relative shadow-[0_0_15px_#00ffcc]"
              style={{ width: `${xpPercent}%` }}
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep"></div>
            </div>
          </div>
        </div>

        {/* XP Earning Rules / Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 pt-1">
          <div className="p-3 rounded-2xl bg-black/30 border border-[#00ffcc]/30 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#00ffcc]" /> Submit Report
              </span>
              <span className="text-[11px] font-headline font-black text-[#00ffcc] bg-[#00ffcc]/10 px-2 py-0.5 rounded-full border border-[#00ffcc]/30">
                +25 XP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-body">Earned upon creating a verified report</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-emerald-500/30 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Fix Resolved
              </span>
              <span className="text-[11px] font-headline font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                +50 XP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-body">Earned when municipal crew fixes issue</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-[#ffe04a]/30 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Star className="w-3 h-3 text-[#ffe04a] fill-[#ffe04a]" /> Rate Resolution
              </span>
              <span className="text-[11px] font-headline font-black text-[#ffe04a] bg-[#ffe04a]/10 px-2 py-0.5 rounded-full border border-[#ffe04a]/30">
                +25 XP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-body">Earned when rating quality feedback</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-outline/30 font-label text-xs uppercase tracking-wider font-bold">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'info'
              ? 'border-secondary text-secondary neon-text-secondary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-primary text-primary neon-text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-2xl p-5 border border-outline/20 space-y-2">
            <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold block">Account Status</span>
            <div className="flex items-center space-x-2 text-emerald-400 font-headline font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Citizen Profile</span>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl p-5 border border-outline/20 space-y-2">
            <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold block">Impact Contributions</span>
            <div className="flex items-center space-x-2 text-secondary font-headline font-bold text-sm">
              <Award className="w-4 h-4 text-secondary" />
              <span>{rank}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container rounded-3xl p-6 border border-primary/30 space-y-4 max-w-md">
          <h3 className="font-headline font-bold text-lg text-on-surface">Change Password</h3>

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
              <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-surface-dim border border-outline/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-dim border border-outline/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-dim border border-outline/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_15px_rgba(255,45,120,0.4)] neon-btn-glow"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
