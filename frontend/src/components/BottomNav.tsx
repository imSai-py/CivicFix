import React from 'react';
import { Home, Map, FilePlus, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register';
  setActiveTab: (tab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register') => void;
  isAuthenticated: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  isAuthenticated,
}) => {
  const isProfileActive = activeTab === 'profile' || activeTab === 'login' || activeTab === 'register';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-secondary/30 shadow-[0_-4px_20px_rgba(0,255,204,0.15)] rounded-t-xl flex justify-around items-center h-20 px-2 pb-safe md:hidden">
      {/* 1. Home */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all active:scale-90 ${
          activeTab === 'home'
            ? 'text-secondary drop-shadow-[0_0_10px_rgba(0,255,204,0.8)] font-bold'
            : 'text-on-surface-variant opacity-60 hover:opacity-100'
        }`}
      >
        {activeTab === 'home' && (
          <div className="absolute -top-3 w-8 h-1 bg-secondary rounded-full shadow-[0_0_8px_#00ffcc]"></div>
        )}
        <Home className="w-5 h-5 mb-1" />
        <span className="font-label text-[10px] uppercase tracking-wider">Home</span>
      </button>

      {/* 2. Map */}
      <button
        onClick={() => setActiveTab('map')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all active:scale-90 ${
          activeTab === 'map'
            ? 'text-secondary drop-shadow-[0_0_10px_rgba(0,255,204,0.8)] font-bold'
            : 'text-on-surface-variant opacity-60 hover:opacity-100'
        }`}
      >
        {activeTab === 'map' && (
          <div className="absolute -top-3 w-8 h-1 bg-secondary rounded-full shadow-[0_0_8px_#00ffcc]"></div>
        )}
        <Map className="w-5 h-5 mb-1" />
        <span className="font-label text-[10px] uppercase tracking-wider">Map</span>
      </button>

      {/* 3. Report (Prominent middle button) */}
      <button
        onClick={() => (isAuthenticated ? setActiveTab('report') : setActiveTab('login'))}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all active:scale-90 -top-3 ${
          activeTab === 'report' ? 'text-primary' : 'text-on-surface-variant'
        }`}
      >
        <div className="bg-surface border border-secondary/50 rounded-full p-2.5 mb-1 shadow-[inset_0_0_8px_rgba(0,255,204,0.2),0_0_12px_rgba(0,255,204,0.4)]">
          <FilePlus className="w-5 h-5 text-secondary" />
        </div>
        <span className="font-label text-[10px] uppercase tracking-wider text-secondary font-bold">Report</span>
      </button>

      {/* 4. Activity Feed */}
      <button
        onClick={() => setActiveTab('activity')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all active:scale-90 ${
          activeTab === 'activity'
            ? 'text-secondary drop-shadow-[0_0_10px_rgba(0,255,204,0.8)] font-bold'
            : 'text-on-surface-variant opacity-60 hover:opacity-100'
        }`}
      >
        {activeTab === 'activity' && (
          <div className="absolute -top-3 w-8 h-1 bg-secondary rounded-full shadow-[0_0_8px_#00ffcc]"></div>
        )}
        <MessageSquare className="w-5 h-5 mb-1" />
        <span className="font-label text-[10px] uppercase tracking-wider">Feed</span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => (isAuthenticated ? setActiveTab('profile') : setActiveTab('login'))}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all active:scale-90 ${
          isProfileActive
            ? 'text-secondary drop-shadow-[0_0_10px_rgba(0,255,204,0.8)] font-bold'
            : 'text-on-surface-variant opacity-60 hover:opacity-100'
        }`}
      >
        {isProfileActive && (
          <div className="absolute -top-3 w-8 h-1 bg-secondary rounded-full shadow-[0_0_8px_#00ffcc]"></div>
        )}
        <User className="w-5 h-5 mb-1" />
        <span className="font-label text-[10px] uppercase tracking-wider">Profile</span>
      </button>
    </nav>
  );
};
