import React, { useState } from 'react';
import { Lock, Mail, Shield, AlertCircle, Eye, EyeOff, Building2, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSuccess: (role?: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showStaffHelper, setShowStaffHelper] = useState(false);

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
      const res = await authApi.login({ email: email.trim(), password });
      await login(res.data);
      
      // Fetch user profile to detect role and route accordingly
      const meRes = await authApi.getMe();
      const userRole = meRes.data.role;

      onSuccess(userRole);
    } catch (err: any) {
      if (!err.response) {
        setErrorMessage('Cannot connect to backend server. Please start the FastAPI backend server using: python -m uvicorn src.main:app --reload --port 8000');
      } else {
        const serverMsg =
          err.response?.data?.error?.message ||
          (typeof err.response?.data?.detail === 'string' ? err.response?.data?.detail : null) ||
          err.response?.data?.detail?.[0]?.msg ||
          'Invalid email or password.';
        setErrorMessage(serverMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 glass-panel p-8 rounded-3xl shadow-2xl border border-indigo-500/20 glow-indigo">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">Sign in to report issues or access municipal operations</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="citizen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="text-indigo-400 font-semibold hover:underline">
          Register Citizen Account
        </button>
      </div>

      {/* Discreet Staff Portal Helper Toggle */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
        <button
          type="button"
          onClick={() => setShowStaffHelper(!showStaffHelper)}
          className="text-[11px] text-slate-500 hover:text-amber-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <Building2 className="w-3 h-3" />
          <span>{showStaffHelper ? 'Hide Staff Presets' : 'Municipal Staff Login'}</span>
        </button>

        {showStaffHelper && (
          <div className="mt-3 p-3 bg-slate-900/90 rounded-2xl border border-amber-500/20 text-left space-y-2 animate-in fade-in duration-200">
            <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> Demo Official Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[10px] font-semibold border border-slate-700 hover:border-amber-500/40 transition-all text-center"
              >
                System Admin
              </button>
              <button
                type="button"
                onClick={fillOfficialCredentials}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[10px] font-semibold border border-slate-700 hover:border-amber-500/40 transition-all text-center"
              >
                Official Staff
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
