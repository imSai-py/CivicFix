import React from 'react';
import { Shield, MapPin, User as UserIcon, FilePlus, LayoutDashboard, MessageSquare, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register';
  setActiveTab: (tab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated } = useAuth();
  const isOfficialOrAdmin = user && (user.role === 'OFFICIAL' || user.role === 'ADMIN');

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-primary/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo matching Stitch Design */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 rounded-xl bg-surface-container border border-primary/40 flex items-center justify-center shadow-[0_0_12px_rgba(255,45,120,0.3)]">
            <Shield className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(255,45,120,0.8)]" />
          </div>
          <div>
            <span className="font-headline font-black text-2xl text-primary drop-shadow-[0_0_8px_rgba(255,45,120,0.8)] tracking-tight">
              Civic<span className="text-secondary neon-text-secondary">Fix</span>
            </span>
            <span className="block font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
              Municipal Operations Hub
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Authenticated vs Public Welcome Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-surface-container/80 p-1.5 rounded-xl border border-secondary/30">
          <button
            onClick={() => setActiveTab('home')}
            className={`font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-secondary text-background shadow-[0_0_12px_#00ffcc]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {isAuthenticated ? 'Home' : 'Welcome'}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-secondary text-background shadow-[0_0_12px_#00ffcc]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'report'
                    ? 'bg-primary text-white shadow-[0_0_12px_#ff2d78]'
                    : 'text-primary hover:neon-text-primary hover:bg-primary/10'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'activity'
                    ? 'bg-secondary text-background shadow-[0_0_12px_#00ffcc]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Feed</span>
              </button>

              {isOfficialOrAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-tertiary text-background shadow-[0_0_12px_#ffe04a]'
                      : 'text-tertiary hover:neon-text-tertiary hover:bg-tertiary/10'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Operations</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-secondary text-background shadow-[0_0_12px_#00ffcc]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'activity'
                    ? 'bg-secondary text-background shadow-[0_0_12px_#00ffcc]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Feed</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                activeTab === 'profile'
                  ? 'bg-secondary/20 border-secondary/50 text-white'
                  : 'bg-surface-container border-outline/30 text-on-surface hover:border-secondary/40'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg font-headline font-bold flex items-center justify-center text-xs text-white ${
                isOfficialOrAdmin ? 'bg-tertiary text-background' : 'bg-primary'
              }`}>
                {user?.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-on-surface">{user?.full_name}</div>
                <div className={`font-label text-[10px] font-bold uppercase tracking-wider ${
                  isOfficialOrAdmin ? 'text-tertiary' : 'text-secondary'
                }`}>{user?.role}</div>
              </div>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('login')}
                className="font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl font-bold text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-secondary" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className="font-label text-xs uppercase tracking-wider px-4.5 py-2 rounded-xl bg-primary text-white font-bold transition-all shadow-[0_0_15px_rgba(255,45,120,0.5)] hover:shadow-[0_0_25px_rgba(255,45,120,0.8)] neon-btn-glow flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
