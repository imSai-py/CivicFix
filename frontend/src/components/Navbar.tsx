import React, { useState } from 'react';
import { Shield, MapPin, User as UserIcon, FilePlus, LayoutDashboard, MessageSquare, Sparkles, LogIn, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationCenterModal } from './NotificationCenterModal';

interface NavbarProps {
  activeTab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register';
  setActiveTab: (tab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated } = useAuth();
  const isOfficialOrAdmin = user && (user.role === 'OFFICIAL' || user.role === 'ADMIN');

  // Modern State-of-the-Art Notification Hub Modal State
  const [showNotificationHub, setShowNotificationHub] = useState(false);
  const [unreadCount] = useState(3);

  return (
    <header className="sticky top-0 z-50 bg-[#090a14]/95 backdrop-blur-xl border-b border-[#ff2d78]/20 shadow-[0_4px_25px_rgba(0,0,0,0.9)] transition-all">
      {/* State-of-the-Art Modern Notification Hub Modal */}
      <NotificationCenterModal
        isOpen={showNotificationHub}
        onClose={() => setShowNotificationHub(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Mobile Header (NO HAMBURGER ICON) */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="cursor-pointer font-headline font-black text-2xl text-[#ff2d78] drop-shadow-[0_0_10px_rgba(255,45,120,0.9)] tracking-tight flex items-center space-x-1.5"
          >
            <span>Civic</span>
            <span className="text-[#00ffcc] drop-shadow-[0_0_10px_rgba(0,255,204,0.9)]">Fix</span>
          </div>

          {/* Bell Notification Button */}
          <button
            type="button"
            onClick={() => setShowNotificationHub(true)}
            className="p-2 text-slate-300 hover:text-[#00ffcc] transition-colors relative active:scale-95 cursor-pointer"
            title="Open Notification Hub"
          >
            <Bell className="w-5 h-5 text-[#00ffcc]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff2d78] text-white font-headline text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#ff2d78]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Brand Logo */}
        <div className="hidden md:flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 rounded-xl bg-[#170e24] border border-[#ff2d78]/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,45,120,0.4)]">
            <Shield className="w-6 h-6 text-[#ff2d78] drop-shadow-[0_0_8px_rgba(255,45,120,0.8)]" />
          </div>
          <div>
            <span className="font-headline font-black text-2xl text-[#ff2d78] drop-shadow-[0_0_8px_rgba(255,45,120,0.8)] tracking-tight">
              Civic<span className="text-[#00ffcc] drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]">Fix</span>
            </span>
            <span className="block font-label text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Municipal Operations Hub
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#101222]/90 p-1.5 rounded-xl border border-[#1b1e36]">
          <button
            onClick={() => setActiveTab('home')}
            className={`font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_15px_#00ffcc]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {isAuthenticated ? 'Home' : 'Welcome'}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_15px_#00ffcc]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
                    ? 'bg-[#ff2d78] text-white shadow-[0_0_15px_#ff2d78]'
                    : 'text-[#ff2d78] hover:bg-[#ff2d78]/10'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center space-x-1.5 font-label text-xs uppercase tracking-wider px-4 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'activity'
                    ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_15px_#00ffcc]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
                      ? 'bg-[#ffe04a] text-slate-950 shadow-[0_0_15px_#ffe04a]'
                      : 'text-[#ffe04a] hover:bg-[#ffe04a]/10'
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
                    ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_15px_#00ffcc]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
                    ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_15px_#00ffcc]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Feed</span>
              </button>
            </>
          )}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Bell Notification Button (Desktop) */}
          <button
            type="button"
            onClick={() => setShowNotificationHub(true)}
            className="p-2.5 rounded-xl bg-[#101222] border border-[#1b1e36] text-slate-300 hover:text-[#00ffcc] hover:border-[#00ffcc]/40 transition-all relative active:scale-95 cursor-pointer"
            title="Open Notification Hub"
          >
            <Bell className="w-4 h-4 text-[#00ffcc]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff2d78] text-white font-headline text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#ff2d78]">
                {unreadCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#00ffcc]/15 border-[#00ffcc]/50 text-white'
                  : 'bg-[#101222] border-[#1b1e36] text-white hover:border-[#00ffcc]/40'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg font-headline font-bold flex items-center justify-center text-xs text-white ${
                isOfficialOrAdmin ? 'bg-[#ffe04a] text-slate-950' : 'bg-[#ff2d78]'
              }`}>
                {user?.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white">{user?.full_name}</div>
                <div className={`font-label text-[10px] font-bold uppercase tracking-wider ${
                  isOfficialOrAdmin ? 'text-[#ffe04a]' : 'text-[#00ffcc]'
                }`}>{user?.role}</div>
              </div>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('login')}
                className={`font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 group border active:scale-95 ${
                  activeTab === 'login'
                    ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_15px_#00ffcc] border-[#00ffcc]'
                    : 'bg-[#101222] border-[#00ffcc]/50 text-[#00ffcc] hover:text-white hover:bg-[#00ffcc]/20 border-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.3)]'
                }`}
              >
                <LogIn className="w-4 h-4 text-[#00ffcc] group-hover:translate-x-1 transition-transform duration-300" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => setActiveTab('register')}
                className="font-label text-xs uppercase tracking-wider px-4.5 py-2 rounded-xl bg-[#ff2d78] text-white font-bold transition-all shadow-[0_0_15px_rgba(255,45,120,0.5)] hover:shadow-[0_0_25px_rgba(255,45,120,0.8)] flex items-center space-x-1.5 active:scale-95"
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
