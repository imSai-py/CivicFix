import React, { useState, useEffect, useRef } from 'react';
import { Home, Map, Plus, MessageSquare, User } from 'lucide-react';

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

  const [isVisible, setIsVisible] = useState(true);
  const [animatedTab, setAnimatedTab] = useState<string | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = () => {
    setIsVisible(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  useEffect(() => {
    resetInactivityTimer();

    const handleScrollOrTouch = () => {
      resetInactivityTimer();
    };

    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });
    window.addEventListener('mousemove', handleScrollOrTouch, { passive: true });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
      window.removeEventListener('mousemove', handleScrollOrTouch);
    };
  }, []);

  const handleTabClick = (tab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register') => {
    setAnimatedTab(tab);
    setTimeout(() => setAnimatedTab(null), 400);
    setActiveTab(tab);
    resetInactivityTimer();
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#080911] border-t border-[#181a2e] shadow-[0_-8px_30px_rgba(0,0,0,0.95)] rounded-t-2xl flex justify-around items-center h-20 px-2 pb-safe md:hidden transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. Home */}
      <button
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 active:scale-125 ${
          animatedTab === 'home' ? 'animate-bounce' : ''
        } ${
          activeTab === 'home'
            ? 'text-[#00ffcc] drop-shadow-[0_0_12px_rgba(0,255,204,0.9)] font-black'
            : 'text-slate-400 opacity-70 hover:opacity-100'
        }`}
      >
        {activeTab === 'home' && (
          <div className="absolute -top-3 w-8 h-1 bg-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc]"></div>
        )}
        <Home className={`w-5 h-5 mb-1 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
        <span className="font-label text-[10px] uppercase tracking-wider font-bold">Home</span>
      </button>

      {/* 2. Map */}
      <button
        onClick={() => handleTabClick('map')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 active:scale-125 ${
          animatedTab === 'map' ? 'animate-bounce' : ''
        } ${
          activeTab === 'map'
            ? 'text-[#00ffcc] drop-shadow-[0_0_12px_rgba(0,255,204,0.9)] font-black'
            : 'text-slate-400 opacity-70 hover:opacity-100'
        }`}
      >
        {activeTab === 'map' && (
          <div className="absolute -top-3 w-8 h-1 bg-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc]"></div>
        )}
        <Map className={`w-5 h-5 mb-1 transition-transform ${activeTab === 'map' ? 'scale-110' : ''}`} />
        <span className="font-label text-[10px] uppercase tracking-wider font-bold">Map</span>
      </button>

      {/* 3. Report (Prominent Glowing Middle Button with Plus Icon) */}
      <button
        onClick={() => handleTabClick(isAuthenticated ? 'report' : 'login')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 active:scale-125 -top-3 ${
          animatedTab === 'report' ? 'animate-bounce' : ''
        } ${
          activeTab === 'report' ? 'text-[#ff2d78]' : 'text-slate-400'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[#1e0f24] border-2 border-[#ff2d78] flex items-center justify-center mb-1 shadow-[0_0_20px_rgba(255,45,120,0.8)] hover:scale-110 transition-transform">
          <Plus className="w-6 h-6 text-[#ff2d78]" />
        </div>
        <span className="font-label text-[10px] uppercase tracking-wider text-[#ff2d78] font-bold">Report</span>
      </button>

      {/* 4. Feed */}
      <button
        onClick={() => handleTabClick('activity')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 active:scale-125 ${
          animatedTab === 'activity' ? 'animate-bounce' : ''
        } ${
          activeTab === 'activity'
            ? 'text-[#00ffcc] drop-shadow-[0_0_12px_rgba(0,255,204,0.9)] font-black'
            : 'text-slate-400 opacity-70 hover:opacity-100'
        }`}
      >
        {activeTab === 'activity' && (
          <div className="absolute -top-3 w-8 h-1 bg-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc]"></div>
        )}
        <MessageSquare className={`w-5 h-5 mb-1 transition-transform ${activeTab === 'activity' ? 'scale-110' : ''}`} />
        <span className="font-label text-[10px] uppercase tracking-wider font-bold">Feed</span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => handleTabClick(isAuthenticated ? 'profile' : 'login')}
        className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 active:scale-125 ${
          animatedTab === 'profile' ? 'animate-bounce' : ''
        } ${
          isProfileActive
            ? 'text-[#00ffcc] drop-shadow-[0_0_12px_rgba(0,255,204,0.9)] font-black'
            : 'text-slate-400 opacity-70 hover:opacity-100'
        }`}
      >
        {isProfileActive && (
          <div className="absolute -top-3 w-8 h-1 bg-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc]"></div>
        )}
        <User className={`w-5 h-5 mb-1 transition-transform ${isProfileActive ? 'scale-110' : ''}`} />
        <span className="font-label text-[10px] uppercase tracking-wider font-bold">Profile</span>
      </button>
    </nav>
  );
};
