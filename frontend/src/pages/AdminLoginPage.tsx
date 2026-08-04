import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, AlertCircle, Eye, EyeOff, Building2, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onSwitchToCitizenLogin: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onSwitchToCitizenLogin }) => {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fillAdminCredentials = () => {
    setEmail('admin@civicfix.gov');
    setPassword('AdminPassword123!');
  };

  const fillOfficialCredentials = () => {
    setEmail('official@civicfix.gov');
    setPassword('OfficialPassword123!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Authenticate against FastAPI auth endpoint
      const res = await authApi.login({ email: email.trim(), password });
      await login(res.data);

      // 2. Fetch User Me profile to verify RBAC Role
      const meRes = await authApi.getMe();
      const role = meRes.data.role;

      if (role !== 'OFFICIAL' && role !== 'ADMIN') {
        logout();
        setErrorMessage('Access Restricted: Only authorized municipal department officials and system administrators can log into the Administrative Portal.');
        return;
      }

      onSuccess();
    } catch (err: any) {
      if (!err.response) {
        setErrorMessage('Cannot connect to backend server. Please start the FastAPI backend server using: python -m uvicorn src.main:app --reload --port 8000');
      } else {
        const serverMsg =
          err.response?.data?.error?.message ||
          (typeof err.response?.data?.detail === 'string' ? err.response?.data?.detail : null) ||
          'Invalid official email or password.';
        setErrorMessage(serverMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 glass-panel p-8 rounded-3xl shadow-2xl border border-amber-500/30 glow-amber">
      {/* Top Header Badge */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Municipal Administrative Portal</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Official Authentication</h2>
        <p className="text-xs text-slate-400 mt-1">Sign in with official credentials to triage and assign reports</p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="official@civicfix.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Secure Password *</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-amber-600/30 disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Authenticating Official...' : 'Sign In to Administrative Console'}
        </button>
      </form>

      {/* Quick Demo Credentials Helper */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1">
          <KeyRound className="w-3 h-3 text-amber-400" /> Default Official Credentials
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-medium border border-slate-800 hover:border-amber-500/40 transition-all text-center"
          >
            🔑 Fill System Admin
          </button>
          <button
            type="button"
            onClick={fillOfficialCredentials}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-medium border border-slate-800 hover:border-amber-500/40 transition-all text-center"
          >
            🔑 Fill Department Official
          </button>
        </div>
      </div>

      {/* Switch to Citizen Login */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Are you a citizen?{' '}
        <button onClick={onSwitchToCitizenLogin} className="text-indigo-400 font-semibold hover:underline">
          Return to Citizen Portal
        </button>
      </div>
    </div>
  );
};
