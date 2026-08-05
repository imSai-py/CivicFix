import React, { useState } from 'react';
import { Shield, LogOut, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

interface ProfilePageProps {
  onSwitchToLogin: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSwitchToLogin }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 my-6">
      {/* Profile Header matching Stitch Screen 5 */}
      <div className="bg-surface-container rounded-3xl p-6 border border-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_20px_rgba(0,255,204,0.1)]">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-dim border-2 border-primary flex items-center justify-center text-primary text-2xl font-headline font-bold shadow-[0_0_15px_rgba(255,45,120,0.6)]">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-headline font-bold text-2xl text-on-surface">{user.full_name}</h1>
              <span className="font-label text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/40">
                {user.role}
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">{user.email}</p>
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
              <span>Active Neighborhood Guardian</span>
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
