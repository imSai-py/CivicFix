import React from 'react';
import { Shield, LayoutDashboard, MapPin, User as UserIcon, FilePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'feed' | 'map' | 'report' | 'admin' | 'profile' | 'login' | 'register';
  setActiveTab: (tab: 'feed' | 'map' | 'report' | 'admin' | 'profile' | 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">Civic<span className="text-indigo-400">Fix</span></span>
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">Municipal Operations Platform</span>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Public Feed
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>GeoMap</span>
          </button>

          <button
            onClick={() => (isAuthenticated ? setActiveTab('report') : setActiveTab('login'))}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'report'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>Report</span>
          </button>

          {user && (user.role === 'OFFICIAL' || user.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                activeTab === 'profile'
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {user?.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200">{user?.full_name}</div>
                <div className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">{user?.role}</div>
              </div>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
