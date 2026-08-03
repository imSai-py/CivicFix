import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Phone, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Strict Email Verification check
    const cleanEmail = email.trim();
    if (!STRICT_EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g., citizen@example.com). Gibberish emails are not allowed.');
      setIsLoading(false);
      return;
    }

    const cleanPhone = phone.trim();
    const formattedPhone = cleanPhone
      ? (cleanPhone.startsWith('+') ? cleanPhone : `+91 ${cleanPhone}`)
      : undefined;

    try {
      await authApi.register({
        full_name: fullName.trim(),
        email: cleanEmail,
        password,
        phone_number: formattedPhone,
      });
      setSuccessMessage('Registration successful! Redirecting to sign in...');
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err: any) {
      if (!err.response) {
        setErrorMessage('Cannot connect to backend server. Please start the FastAPI backend server using: python -m uvicorn src.main:app --reload --port 8000');
      } else {
        const serverMsg =
          err.response?.data?.error?.message ||
          (typeof err.response?.data?.detail === 'string' ? err.response?.data?.detail : null) ||
          err.response?.data?.detail?.[0]?.msg ||
          'Registration failed. Please check your inputs and try again.';
        setErrorMessage(serverMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 glass-panel p-8 rounded-3xl shadow-2xl border border-indigo-500/20 glow-indigo">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Citizen Account</h2>
        <p className="text-xs text-slate-400 mt-1">Join your community civic reporting platform</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              minLength={2}
              maxLength={150}
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
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
          <span className="text-[10px] text-slate-500 mt-1 block">Must be a valid email format (e.g. user@domain.com)</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
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
          <span className="text-[10px] text-slate-500 mt-1 block">Minimum 8 characters</span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-300">Phone Number (+91 India)</label>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Optional</span>
          </div>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="tel"
              placeholder="+91 98765 43210 (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Already registered?{' '}
        <button onClick={onSwitchToLogin} className="text-indigo-400 font-semibold hover:underline">
          Sign In
        </button>
      </div>
    </div>
  );
};
