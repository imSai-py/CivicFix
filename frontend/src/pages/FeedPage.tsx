import React, { useEffect, useState } from 'react';
import {
  Search,
  ShieldCheck,
  Activity,
  Tag,
  ListFilter,
  FilePlus,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  Building2,
  X
} from 'lucide-react';
import { IssueCard } from '../components/IssueCard';
import { issuesApi, categoriesApi } from '../services/api';
import { Category, Issue } from '../types';
import { CustomDropdown, DropdownOption } from '../components/CustomDropdown';

interface FeedPageProps {
  isAuthenticated: boolean;
  onNavigate?: (tab: 'feed' | 'map' | 'report' | 'admin' | 'profile' | 'login' | 'register') => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({ isAuthenticated, onNavigate }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

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

  // Filtered Issues Calculation
  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.location.address && i.location.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = highPriorityOnly ? (i.priority === 'HIGH' || i.priority === 'CRITICAL') : true;

    return matchesSearch && matchesPriority;
  });

  // Impact Metrics Calculation
  const totalIssuesCount = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ACKNOWLEDGED').length;

  const navigateTo = (tab: 'feed' | 'map' | 'report' | 'admin' | 'profile' | 'login' | 'register') => {
    if (onNavigate) onNavigate(tab);
  };

  // Status Dropdown Options
  const statusOptions: DropdownOption[] = [
    { value: '', label: 'All Statuses', icon: <ListFilter className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'SUBMITTED', label: 'Submitted', badgeColor: 'bg-amber-500' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged', badgeColor: 'bg-blue-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', badgeColor: 'bg-indigo-500' },
    { value: 'RESOLVED', label: 'Resolved', badgeColor: 'bg-emerald-500' },
    { value: 'REJECTED', label: 'Rejected', badgeColor: 'bg-rose-500' },
  ];

  // Category Dropdown Options
  const categoryOptions: DropdownOption[] = [
    { value: '', label: 'All Categories', icon: <Tag className="w-3.5 h-3.5 text-slate-400" /> },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: <Tag className="w-3.5 h-3.5 text-indigo-400" />,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* 1. Stronger Hero Section */}
      <div className="relative rounded-3xl p-6 sm:p-12 overflow-hidden glass-panel glow-indigo border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Civic Infrastructure Operations Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Transparent Civic Reporting <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300">
              For Better, Safer Cities.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Report infrastructure failures, potholes, streetlights, and public hazards directly to municipal department officials with real-time audit lifecycle tracking.
          </p>

          {/* Primary & Secondary Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigateTo(isAuthenticated ? 'report' : 'login')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/40 hover:scale-[1.02] active:scale-95"
            >
              <FilePlus className="w-5 h-5" />
              <span>Report an Issue Now</span>
            </button>

            <button
              onClick={() => navigateTo('map')}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-indigo-500/40 transition-all"
            >
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>View Live GeoMap</span>
            </button>

            <button
              onClick={() => setSelectedStatus('RESOLVED')}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium text-sm border border-slate-800 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>See Recent Fixes</span>
            </button>
          </div>

          {/* 3-Step How It Works Benefit Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1. Report in 30 Seconds</h4>
                <p className="text-[11px] text-slate-400">Snap photo & auto-geotag location</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">2. Real-Time Tracking</h4>
                <p className="text-[11px] text-slate-400">Follow official department logs</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">3. Verified Neighborhood Fix</h4>
                <p className="text-[11px] text-slate-400">Municipal crew resolves hazard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Impact & Social Proof Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="text-2xl font-extrabold text-white mt-1">{totalIssuesCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Fixes Resolved</span>
            <div className="text-2xl font-extrabold text-white mt-1">{resolvedCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">Active Crews</span>
            <div className="text-2xl font-extrabold text-white mt-1">{inProgressCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Municipal Depts</span>
            <div className="text-2xl font-extrabold text-white mt-1">4 Active</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Clickable Category Quick-Filter Strip */}
      <div className="glass-panel p-4 rounded-2xl space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Browse Issues By Category</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/50'
                    : 'bg-slate-900/90 hover:bg-indigo-600/20 text-slate-300 border border-slate-800 hover:border-indigo-500/30'
                }`}
              >
                <span>{emoji}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. First-Time Visitor Banner & Expandable Guide */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">New to CivicFix?</h3>
              <p className="text-xs text-slate-400">Report your first municipal issue in under a minute with real-time audit updates.</p>
            </div>
          </div>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-xl hover:bg-indigo-600/10 transition-colors"
          >
            <span>{showHowItWorks ? 'Hide Guide' : 'How It Works'}</span>
            {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHowItWorks && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 animate-in fade-in duration-200">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="font-bold text-indigo-400 block mb-1">Step 1: Capture Evidence</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">Take a photo with your phone or camera, pick an issue category, and your GPS location will auto-fill.</p>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">Step 2: Official Triage</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">Municipal department officials review your report, acknowledge it, and assign a specialized maintenance crew.</p>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Step 3: Verification & Fix</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">Crews complete work on-site, status updates to RESOLVED, and audit logs are recorded permanently.</p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Prominent Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search reported issues by title, description, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Chips & Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* High Priority Quick Toggle */}
          <button
            onClick={() => setHighPriorityOnly(!highPriorityOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              highPriorityOnly
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🔥 High Priority Only
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
      </div>

      {/* 6. Feed Cards Grid & Empty State */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Reported Civic Issues</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono font-semibold border border-indigo-500/30">
              {filteredIssues.length} Reports
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-2xl p-6 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          /* Rich Empty State */
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto my-8 border border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Issues Matching Filters</h3>
              <p className="text-xs text-slate-400 mt-1">There are no reported civic hazards matching your current search or status filters.</p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedCategory('');
                  setSearchQuery('');
                  setHighPriorityOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                Reset Filters
              </button>
              <button
                onClick={() => navigateTo(isAuthenticated ? 'report' : 'login')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                Be the First to Report One
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
      </div>
    </div>
  );
};
