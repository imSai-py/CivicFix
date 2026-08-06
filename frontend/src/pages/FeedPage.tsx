import React, { useEffect, useState } from 'react';
import {
  Search,
  ShieldCheck,
  Tag,
  ListFilter,
  Megaphone,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
  X,
  Radio,
  ArrowRight
} from 'lucide-react';
import { IssueCard } from '../components/IssueCard';
import { issuesApi, categoriesApi, getAttachmentUrl } from '../services/api';
import { Category, Issue } from '../types';
import { CustomDropdown, DropdownOption } from '../components/CustomDropdown';
import { useAuth } from '../context/AuthContext';

interface FeedPageProps {
  isAuthenticated: boolean;
  onNavigate?: (tab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register') => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({ isAuthenticated, onNavigate }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = new Date().getHours();
  const greetingText = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highPriorityOnly, setHighPriorityOnly] = useState<boolean>(false);

  const fetchFeedData = async () => {
    setIsLoading(true);
    try {
      const [issueRes, catRes] = await Promise.all([
        issuesApi.list({
          status: selectedStatus || undefined,
          category_id: selectedCategory || undefined,
          limit: 100
        }),
        categoriesApi.list(),
      ]);

      setIssues(issueRes.data.items || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load feed data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, [selectedStatus, selectedCategory]);

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.location.address && i.location.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = highPriorityOnly ? (i.priority === 'HIGH' || i.priority === 'CRITICAL') : true;

    return matchesSearch && matchesPriority;
  });

  // Impact Metrics
  const totalIssuesCount = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ACKNOWLEDGED').length;

  const navigateTo = (tab: 'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register') => {
    if (onNavigate) onNavigate(tab);
  };

  const statusOptions: DropdownOption[] = [
    { value: '', label: 'All Statuses', icon: <ListFilter className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'SUBMITTED', label: 'Submitted', badgeColor: 'bg-amber-500' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged', badgeColor: 'bg-blue-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', badgeColor: 'bg-indigo-500' },
    { value: 'RESOLVED', label: 'Resolved', badgeColor: 'bg-emerald-500' },
    { value: 'REJECTED', label: 'Rejected', badgeColor: 'bg-rose-500' },
  ];

  const categoryOptions: DropdownOption[] = [
    { value: '', label: 'All Categories', icon: <Tag className="w-3.5 h-3.5 text-slate-400" /> },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: <Tag className="w-3.5 h-3.5 text-indigo-400" />,
    })),
  ];

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Alex';
  const formattedReported = totalIssuesCount < 10 ? `0${totalIssuesCount}` : `${totalIssuesCount}`;
  const formattedResolved = resolvedCount < 10 ? `0${resolvedCount}` : `${resolvedCount}`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-1 sm:px-0">
      {/* 1. Greeting Header with Dynamic Time & Live Clock */}
      <section className="space-y-1">
        <h2 className="font-headline font-bold text-3xl md:text-4xl text-white tracking-tight">
          {greetingText}, <span className="text-[#00ffcc] neon-text-secondary font-bold">{firstName}</span>.
        </h2>
        <p className="font-label text-xs text-slate-400 uppercase tracking-widest flex items-center space-x-2">
          <span>MUNICIPAL OPERATIONS GRID</span>
          <span>•</span>
          <span className="text-[#00ffcc] font-mono font-bold">{currentTime || 'LIVE'}</span>
        </p>
      </section>

      {/* 2. Quick Stats Bento Grid matching EXACT Stitch Screen 2 */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Stat 1: Reported (Cyan Neon Border & Accent) */}
          <div className="bg-[#0c1520] rounded-2xl p-5 border border-[#00ffcc]/40 shadow-[0_0_15px_rgba(0,255,204,0.15)] flex flex-col justify-between h-36 relative overflow-hidden group">
            <div className="flex items-center space-x-2 text-[#00ffcc]">
              <FileText className="w-5 h-5 text-[#00ffcc]" />
              <span className="font-label text-xs uppercase tracking-wider font-bold text-[#00ffcc]">REPORTED</span>
            </div>
            <div className="font-headline font-bold text-4xl text-white">
              {formattedReported}
            </div>
          </div>

          {/* Stat 2: Resolved (Subtle Indigo Glass & Purple Title) */}
          <div className="bg-[#121224] rounded-2xl p-5 border border-[#252542] flex flex-col justify-between h-36 relative overflow-hidden group">
            <div className="flex items-center space-x-2 text-[#8b8ba7]">
              <CheckCircle2 className="w-5 h-5 text-[#8b8ba7]" />
              <span className="font-label text-xs uppercase tracking-wider font-bold text-[#8b8ba7]">RESOLVED</span>
            </div>
            <div className="font-headline font-bold text-4xl text-white">
              {formattedResolved}
            </div>
          </div>
        </div>

        {/* Stat 3: Grid Status (Maroon/Pink Tinted Glass) */}
        <div className="bg-[#1a0f1d] rounded-2xl p-5 border border-[#ff2d78]/30 shadow-[0_0_20px_rgba(255,45,120,0.15)] flex items-center justify-between relative overflow-hidden group">
          <div>
            <h3 className="font-label text-xs uppercase tracking-wider text-[#ff2d78] mb-1 font-bold">CITY GRID STATUS</h3>
            <p className="font-headline font-bold text-lg text-white">Stable • {inProgressCount} Active Fixes</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#281128] border border-[#ff2d78]/40 flex items-center justify-center text-[#ff2d78] shadow-[0_0_12px_rgba(255,45,120,0.4)]">
            <Zap className="w-5 h-5 text-[#ff2d78] fill-[#ff2d78]" />
          </div>
        </div>
      </section>

      {/* 3. Main Action CTA Button matching EXACT Stitch Screen 2 */}
      <section>
        <button
          onClick={() => navigateTo(isAuthenticated ? 'report' : 'login')}
          className="w-full bg-[#1e0f24] border-2 border-[#ff2d78] text-white rounded-2xl py-4 px-6 flex items-center justify-center space-x-3 shadow-[0_0_25px_rgba(255,45,120,0.35)] hover:shadow-[0_0_35px_rgba(255,45,120,0.7)] active:scale-95 transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          {/* Shimmer Sweep Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff2d78]/20 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none"></div>

          <Megaphone className="w-6 h-6 text-[#ff2d78] fill-[#ff2d78] group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-headline font-bold text-lg text-white tracking-wide relative z-10">
            Report an Issue
          </span>
        </button>
      </section>

      {/* 4. Happening Nearby Horizontal Snap-Scroll Stream */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-xl text-white flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#00ffcc]/15 border border-[#00ffcc]/30 flex items-center justify-center text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)]">
              <Radio className="w-4 h-4 text-[#00ffcc] animate-pulse" />
            </div>
            <span>Happening Nearby</span>
          </h3>
          <button
            onClick={() => navigateTo('map')}
            className="text-[#00ffcc] font-label text-xs uppercase tracking-wider hover:underline font-bold"
          >
            VIEW MAP
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar">
          {issues.slice(0, 6).map((issue) => {
            const hasPhoto = issue.attachments && issue.attachments.length > 0;
            return (
              <div
                key={issue.id}
                onClick={() => navigateTo('activity')}
                className="min-w-[280px] max-w-[300px] snap-center bg-[#0e101d] rounded-2xl border border-[#1b1e34] p-4 flex flex-col justify-between gap-3 group hover:border-[#00ffcc]/50 transition-colors cursor-pointer shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-label text-[10px] uppercase px-2.5 py-0.5 rounded font-bold tracking-wider ${
                      issue.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      issue.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40'
                    }`}>
                      {issue.status}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {hasPhoto && (
                    <div className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-800 mb-2">
                      <img
                        src={getAttachmentUrl(issue.attachments[0].file_path)}
                        alt={issue.title}
                        className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <h4 className="font-headline font-semibold text-sm mb-1 text-white truncate">{issue.title}</h4>
                  <p className="font-body text-xs text-slate-400 line-clamp-2">{issue.description}</p>
                </div>

                <div className="flex items-center text-xs text-slate-400 font-body pt-2 border-t border-slate-800/80">
                  <MapPin className="w-3.5 h-3.5 text-[#00ffcc] mr-1 shrink-0" />
                  <span className="truncate">{issue.location.address || `${issue.location.latitude.toFixed(3)}, ${issue.location.longitude.toFixed(3)}`}</span>
                </div>
              </div>
            );
          })}

          <div
            onClick={() => navigateTo('map')}
            className="min-w-[200px] snap-center bg-[#0e101d] rounded-2xl border border-[#1b1e34] p-4 flex flex-col items-center justify-center group hover:border-[#00ffcc]/50 transition-colors cursor-pointer shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-[#171a2e] flex items-center justify-center mb-2 group-hover:bg-[#00ffcc]/20 group-hover:text-[#00ffcc] transition-colors text-slate-400">
              <ArrowRight className="w-6 h-6" />
            </div>
            <span className="font-label text-xs uppercase tracking-widest text-slate-300 group-hover:text-[#00ffcc] transition-colors font-bold">View All</span>
          </div>
        </div>
      </section>

      {/* 5. Clickable Category Quick-Filter Strip */}
      <section className="bg-[#0e101d] p-5 rounded-2xl border border-[#1b1e34] space-y-3 shadow-xl">
        <span className="font-label text-xs font-bold text-slate-400 uppercase tracking-wider block">Browse Issues By Category</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_15px_#00ffcc]'
                : 'bg-[#15172a] text-slate-300 hover:text-white border border-[#232745]'
            }`}
          >
            🌟 All Categories
          </button>

          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            const emoji =
              c.name.includes('Potholes') ? '🕳️' :
              c.name.includes('Streetlight') ? '💡' :
              c.name.includes('Water') ? '𚰰' :
              c.name.includes('Garbage') ? '🗑️' :
              c.name.includes('Drainage') ? '🌊' : '⚙️';

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(isSelected ? '' : c.id)}
                className={`font-headline text-xs px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-[#ff2d78] text-white shadow-[0_0_15px_#ff2d78] border border-[#ff2d78]/50'
                    : 'bg-[#15172a] hover:bg-[#ff2d78]/20 text-slate-200 border border-[#232745]'
                }`}
              >
                <span>{emoji}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Onboarding Banner & Expandable Guide */}
      <section className="bg-[#0e101d] p-5 rounded-2xl border border-[#ff2d78]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#ff2d78]/20 text-[#ff2d78]">
              <Sparkles className="w-5 h-5 text-[#ff2d78]" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-white">New to CivicFix?</h3>
              <p className="font-body text-xs text-slate-400">Report your first municipal issue in under a minute with real-time audit updates.</p>
            </div>
          </div>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex items-center space-x-1 font-label text-xs font-bold text-[#00ffcc] hover:text-[#00ffcc] px-3 py-1.5 rounded-xl hover:bg-[#00ffcc]/10 transition-colors uppercase tracking-wider"
          >
            <span>{showHowItWorks ? 'Hide Guide' : 'How It Works'}</span>
            {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHowItWorks && (
          <div className="mt-4 pt-4 border-t border-[#ff2d78]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 font-body text-xs text-white animate-in fade-in duration-200">
            <div className="bg-[#141629] p-4 rounded-xl border border-[#232745]">
              <span className="font-headline font-bold text-[#ff2d78] block mb-1">Step 1: Capture Evidence</span>
              <p className="text-slate-400 text-xs leading-relaxed">Take a photo with your phone, pick an issue category, and your GPS coordinates will auto-fill.</p>
            </div>
            <div className="bg-[#141629] p-4 rounded-xl border border-[#232745]">
              <span className="font-headline font-bold text-[#ffe04a] block mb-1">Step 2: Official Triage</span>
              <p className="text-slate-400 text-xs leading-relaxed">Municipal officials review your report, acknowledge it, and dispatch a specialized maintenance crew.</p>
            </div>
            <div className="bg-[#141629] p-4 rounded-xl border border-[#232745]">
              <span className="font-headline font-bold text-[#00ffcc] block mb-1">Step 3: Verification & Fix</span>
              <p className="text-slate-400 text-xs leading-relaxed">Crews complete work on-site, status updates to RESOLVED, and audit logs are recorded permanently.</p>
            </div>
          </div>
        )}
      </section>

      {/* 7. Search & Filter Controls */}
      <section className="bg-[#0e101d] p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 border border-[#1b1e34]">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search reported issues by title, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141629] border border-[#232745] rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00ffcc] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => setHighPriorityOnly(!highPriorityOnly)}
            className={`font-label text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl font-bold transition-all ${
              highPriorityOnly
                ? 'bg-[#ff2d78] text-white shadow-[0_0_15px_#ff2d78]'
                : 'bg-[#15172a] text-slate-300 hover:text-white border border-[#232745]'
            }`}
          >
            🔥 High Priority
          </button>

          <CustomDropdown
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            className="w-44"
          />

          <CustomDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            className="w-48"
          />
        </div>
      </section>

      {/* 8. Feed Cards Grid & Rich Empty State */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-bold text-lg text-white flex items-center space-x-2">
            <span>Reported Civic Issues</span>
            <span className="font-label text-xs bg-[#00ffcc]/20 text-[#00ffcc] px-2.5 py-0.5 rounded-full font-bold border border-[#00ffcc]/40">
              {filteredIssues.length} Reports
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#0e101d] rounded-2xl p-6 h-64 animate-pulse border border-[#1b1e34]"></div>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-[#0e101d] rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto my-8 border border-[#00ffcc]/30">
            <div className="w-16 h-16 rounded-3xl bg-[#00ffcc]/10 border border-[#00ffcc]/40 flex items-center justify-center mx-auto text-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.4)]">
              <ShieldCheck className="w-8 h-8 text-[#00ffcc]" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-white">No Issues Matching Filters</h3>
              <p className="font-body text-xs text-slate-400 mt-1">There are no reported civic hazards matching your current search or status filters.</p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedCategory('');
                  setSearchQuery('');
                  setHighPriorityOnly(false);
                }}
                className="font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-[#15172a] hover:bg-slate-800 text-white font-bold transition-all border border-[#232745]"
              >
                Reset Filters
              </button>
              <button
                onClick={() => navigateTo(isAuthenticated ? 'report' : 'login')}
                className="font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-[#ff2d78] text-white font-bold transition-all shadow-[0_0_15px_#ff2d78]"
              >
                Be the First to Report
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                isAuthenticated={isAuthenticated}
                onRefresh={fetchFeedData}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
