import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Bell, X, CheckCircle2, Clock, ThumbsUp, MessageSquare, Sparkles, Check, ChevronRight, ShieldCheck, MapPin, Zap, Eye } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'RESOLVED' | 'STATUS_UPDATE' | 'UPVOTE' | 'COMMENT' | 'SUBMITTED';
  category: 'updates' | 'social' | 'system';
  title: string;
  subtitle: string;
  message: string;
  timestamp: string;
  read: boolean;
  actor?: {
    name: string;
    role: string;
    avatarLetter: string;
  };
  issueData?: {
    id: string;
    title: string;
    status: string;
    location: string;
    xpEarned?: number;
    beforeImage?: string;
    afterImage?: string;
    crewNotes?: string;
  };
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'home' | 'map' | 'report' | 'activity' | 'profile') => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'RESOLVED',
    category: 'updates',
    title: 'Pothole Hazard Fully Resolved!',
    subtitle: 'Municipal Works Crew #4 • Verified Fix',
    message: 'Your report "Dangerous Pothole on 5th Avenue" has passed safety inspection. Road resurfacing is complete!',
    timestamp: '12 mins ago',
    read: false,
    actor: {
      name: 'Municipal Public Works',
      role: 'OFFICIAL CREW',
      avatarLetter: 'M',
    },
    issueData: {
      id: 'iss-101',
      title: 'Dangerous Pothole on 5th Avenue',
      status: 'RESOLVED',
      location: '5th Ave & Market St',
      xpEarned: 50,
      crewNotes: 'Asphalt resurfaced, sealed with weather-resistant polymer compounds.',
    },
  },
  {
    id: 'notif-2',
    type: 'STATUS_UPDATE',
    category: 'updates',
    title: 'Status Updated to In Progress ⚡',
    subtitle: 'Electrical Grid Department • Assessment',
    message: 'Field technician team assigned to "Broken Streetlight on Market St". Replacement LED fixture dispatched.',
    timestamp: '45 mins ago',
    read: false,
    actor: {
      name: 'Electrical Grid Ops',
      role: 'OFFICIAL',
      avatarLetter: 'E',
    },
    issueData: {
      id: 'iss-102',
      title: 'Broken Streetlight on Market St',
      status: 'IN_PROGRESS',
      location: 'Market St Sector 4',
      crewNotes: 'High-mast crane unit arriving on-site at 14:00 PM.',
    },
  },
  {
    id: 'notif-3',
    type: 'UPVOTE',
    category: 'social',
    title: 'New Upvotes on Your Report 👍',
    subtitle: 'Community Citizen Engagement',
    message: '@citizen_ramesh, @priya_m, and 4 other citizens upvoted your hazard report.',
    timestamp: '2 hours ago',
    read: false,
    actor: {
      name: 'Ramesh Kumar',
      role: 'CITIZEN',
      avatarLetter: 'R',
    },
    issueData: {
      id: 'iss-101',
      title: 'Dangerous Pothole on 5th Avenue',
      status: 'RESOLVED',
      location: '5th Ave & Market St',
    },
  },
  {
    id: 'notif-4',
    type: 'COMMENT',
    category: 'social',
    title: 'Official Department Response 💬',
    subtitle: 'Public Safety Sector',
    message: 'Municipal Works commented: "Heavy drainage pump trucks have been deployed to clear standing water."',
    timestamp: '3 hours ago',
    read: true,
    actor: {
      name: 'Sanitation Department',
      role: 'OFFICIAL',
      avatarLetter: 'S',
    },
    issueData: {
      id: 'iss-103',
      title: 'Drainage Overflow on Main Street',
      status: 'SUBMITTED',
      location: 'Main St & 2nd Cross',
    },
  },
  {
    id: 'notif-5',
    type: 'SUBMITTED',
    category: 'system',
    title: 'Report Issued & Dispatched 📌',
    subtitle: 'CivicFix Operations Hub',
    message: 'Your report "Water Leakage" was successfully registered with vector coordinates (+25 XP).',
    timestamp: '1 day ago',
    read: true,
    issueData: {
      id: 'iss-104',
      title: 'Water Leakage',
      status: 'SUBMITTED',
      location: 'Sector 9 Water Line',
      xpEarned: 25,
    },
  },
];

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'updates' | 'social'>('all');
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'updates') return n.category === 'updates';
    if (activeFilter === 'social') return n.category === 'social';
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setSelectedNotif(notif);
  };

  const getTypeBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'RESOLVED':
        return (
          <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        );
      case 'STATUS_UPDATE':
        return (
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        );
      case 'UPVOTE':
        return (
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#00ffcc]/15 border border-[#00ffcc]/40 text-[#00ffcc] shrink-0 shadow-[0_0_10px_#00ffcc]">
            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        );
      case 'COMMENT':
        return (
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#ff2d78]/15 border border-[#ff2d78]/40 text-[#ff2d78] shrink-0 shadow-[0_0_10px_#ff2d78]">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#00ffcc]/15 border border-[#00ffcc]/40 text-[#00ffcc] shrink-0 shadow-[0_0_10px_#00ffcc]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        );
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-[#0e101d] sm:bg-slate-950/85 sm:backdrop-blur-xl flex items-center justify-center p-0 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#0e101d] w-full h-full sm:h-auto sm:max-h-[85vh] max-w-2xl flex flex-col overflow-hidden sm:rounded-3xl border-0 sm:border border-[#00ffcc]/40 shadow-[0_0_50px_rgba(0,255,204,0.25)] relative">
        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-[#1b1e34] bg-[#101222] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#00ffcc]/15 border border-[#00ffcc]/40 text-[#00ffcc] shrink-0 shadow-[0_0_12px_#00ffcc]">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ffcc]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="font-headline font-bold text-base sm:text-xl text-white truncate">Notification Hub</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#ff2d78] text-white font-headline text-[9px] sm:text-xs font-bold shadow-[0_0_10px_#ff2d78] shrink-0">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="font-label text-[9px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold truncate">
                Real-Time Municipal Alerts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#141629] border border-[#00ffcc]/40 text-[#00ffcc] font-label text-[10px] sm:text-[11px] uppercase font-bold hover:bg-[#00ffcc]/10 transition-all flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-[#00ffcc]" />
                <span className="hidden sm:inline">Mark Read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="px-3 sm:px-5 py-2.5 border-b border-[#1b1e34] bg-[#0e101d] flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'updates', label: 'Fixes & Status' },
            { id: 'social', label: 'Upvotes & Comments' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-label text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_12px_#00ffcc]'
                  : 'bg-[#141629] text-slate-300 hover:text-white border border-[#232745]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 no-scrollbar">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-headline font-bold text-white text-sm sm:text-base">No Notifications Found</p>
              <p className="font-body text-xs">You're all caught up! New updates on your reports will appear here.</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative group flex flex-col gap-2 ${
                  notif.read
                    ? 'bg-[#141629]/50 border-[#232745] opacity-80 hover:opacity-100 hover:border-[#00ffcc]/30'
                    : 'bg-[#141629] border-[#00ffcc]/40 shadow-[0_0_20px_rgba(0,255,204,0.12)] hover:border-[#00ffcc]'
                }`}
              >
                {/* Unread Glow Ribbon */}
                {!notif.read && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#ff2d78] shadow-[0_0_10px_#ff2d78]"></div>
                )}

                {/* Card Top Info */}
                <div className="flex items-start gap-2.5 min-w-0">
                  {getTypeBadge(notif.type)}

                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <h4 className="font-headline font-bold text-xs sm:text-sm text-white group-hover:text-[#00ffcc] transition-colors leading-snug break-words">
                        {notif.title}
                      </h4>
                      {notif.issueData?.xpEarned && (
                        <span className="font-label text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/30 shrink-0">
                          +{notif.issueData.xpEarned} XP
                        </span>
                      )}
                    </div>
                    <span className="font-label text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block mt-0.5 break-words">
                      {notif.subtitle} • <span className="font-mono text-slate-500">{notif.timestamp}</span>
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <p className="font-body text-xs text-slate-300 leading-relaxed break-words">
                  {notif.message}
                </p>

                {/* Click Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-[#1b1e34] text-[10px] sm:text-[11px] font-label font-bold text-[#00ffcc]">
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Full Audit Details <ChevronRight className="w-3.5 h-3.5 text-[#00ffcc]" />
                  </span>
                  {notif.issueData?.status && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] sm:text-[10px] text-slate-300 uppercase shrink-0">
                      Status: {notif.issueData.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* DETAILED AUDIT DRAWER MODAL */}
        {selectedNotif && (
          <div className="absolute inset-0 z-50 bg-[#0e101d] p-4 sm:p-6 flex flex-col space-y-4 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            {/* Detail Drawer Top Header */}
            <div className="flex justify-between items-center border-b border-[#1b1e34] pb-3 shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                <ShieldCheck className="w-5 h-5 text-[#00ffcc] shrink-0" />
                <h3 className="font-headline font-bold text-base sm:text-lg text-white truncate">Audit Detail View</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Focus Header */}
            <div className="bg-[#141629] p-3.5 sm:p-4 rounded-2xl border border-[#00ffcc]/40 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="font-label text-[9px] sm:text-[10px] uppercase font-bold text-[#00ffcc] tracking-wider">
                  {selectedNotif.subtitle}
                </span>
                <span className="font-mono text-xs text-slate-400">{selectedNotif.timestamp}</span>
              </div>
              <h2 className="font-headline font-bold text-base sm:text-xl text-white break-words">{selectedNotif.title}</h2>
              <p className="font-body text-xs text-slate-300 leading-relaxed break-words">{selectedNotif.message}</p>
            </div>

            {/* Issue Context Data */}
            {selectedNotif.issueData && (
              <div className="bg-[#141629] p-3.5 sm:p-4 rounded-2xl border border-[#232745] space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="font-label text-[9px] uppercase font-bold text-slate-400 block">Report Title</span>
                    <h4 className="font-headline font-bold text-sm sm:text-base text-white mt-0.5 break-words">{selectedNotif.issueData.title}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00ffcc]/15 border border-[#00ffcc]/40 text-[#00ffcc] font-label text-[10px] sm:text-xs uppercase font-bold shrink-0">
                    {selectedNotif.issueData.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-body text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#00ffcc] shrink-0" />
                  <span className="truncate">{selectedNotif.issueData.location}</span>
                </div>

                {selectedNotif.issueData.crewNotes && (
                  <div className="p-3 rounded-xl bg-[#0c0c18] border border-emerald-500/30 text-xs font-body text-slate-300 italic break-words">
                    <span className="text-emerald-400 font-semibold not-italic">Official Crew Remarks:</span> "{selectedNotif.issueData.crewNotes}"
                  </div>
                )}

                {selectedNotif.issueData.xpEarned && (
                  <div className="flex items-center space-x-2 p-3 rounded-xl bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-xs font-label font-bold text-[#00ffcc]">
                    <Zap className="w-4 h-4 text-[#ffe04a] shrink-0" />
                    <span>+{selectedNotif.issueData.xpEarned} XP Reputation Earned & Credited</span>
                  </div>
                )}
              </div>
            )}

            {/* Actor Profile Info */}
            {selectedNotif.actor && (
              <div className="p-3 rounded-2xl bg-[#141629] border border-[#232745] flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] font-headline font-bold flex items-center justify-center text-xs shrink-0">
                  {selectedNotif.actor.avatarLetter}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-headline font-bold text-xs text-white truncate">{selectedNotif.actor.name}</span>
                    <span className="font-label text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-[#ffe04a]/20 text-[#ffe04a] shrink-0">
                      {selectedNotif.actor.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-body block truncate">Authorized Operations Actor</span>
                </div>
              </div>
            )}

            {/* In-Place Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="w-full sm:flex-1 py-2.5 rounded-2xl bg-[#141629] border border-[#232745] text-slate-300 font-label font-bold text-xs uppercase tracking-wider hover:text-white transition-all"
              >
                Back to Notifications
              </button>

              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNotif(null);
                    onClose();
                    onNavigateToTab('map');
                  }}
                  className="w-full sm:flex-1 py-2.5 rounded-2xl bg-[#00ffcc] text-slate-950 font-label font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_#00ffcc]"
                >
                  <Eye className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>View on GeoMap</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
