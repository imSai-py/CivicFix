import React from 'react';
import { Home, Map, FilePlus, Bell, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'feed' | 'map' | 'admin' | 'profile' | 'login' | 'register';
  setActiveTab: (tab: 'feed' | 'map' | 'admin' | 'profile' | 'login' | 'register') => void;
  onOpenReportModal: () => void;
  isAuthenticated: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  isAuthenticated,
}) => {
  const isProfileActive = activeTab === 'profile' || activeTab === 'login' || activeTab === 'register';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'feed' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'feed' && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500"></span>
          )}
          <Home className={`w-5 h-5 ${activeTab === 'feed' ? 'fill-indigo-500/20' : ''}`} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>

        {/* Map */}
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'map' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'map' && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500"></span>
          )}
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Map</span>
        </button>

        {/* Report Action Button */}
        <button
          onClick={onOpenReportModal}
          className="flex flex-col items-center py-1 px-3 text-slate-400 hover:text-slate-200 transition-all"
        >
          <FilePlus className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] font-medium mt-1 text-slate-300">Report</span>
        </button>

        {/* Updates / Admin Console */}
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'admin' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'admin' && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500"></span>
          )}
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Updates</span>
        </button>

        {/* Profile / Auth */}
        <button
          onClick={() => (isAuthenticated ? setActiveTab('profile') : setActiveTab('login'))}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
            isProfileActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isProfileActive && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500"></span>
          )}
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
