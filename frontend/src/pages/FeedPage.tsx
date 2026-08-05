import React, { useEffect, useState } from 'react';
import {
  Search,
  ShieldCheck,
  Tag,
  ListFilter,
  FilePlus,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
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

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Citizen';

  return (
    <div className="space-y-10">
      {/* 1. Greeting Header matching Stitch Screen 2 */}
      <section className="relative space-y-2">
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="font-headline font-bold text-3xl md:text-5xl text-on-surface tracking-tight">
          Good evening, <span className="text-secondary neon-text-secondary font-black">{firstName}</span>.
        </h2>
        <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest opacity-90 font-semibold">
          Municipal Operations Sector • Live Platform Stream
        </p>
      </section>

      {/* 2. Quick Stats Bento Grid matching Stitch Screen 2 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Reported */}
        <div className="neon-card-secondary rounded-2xl p-5 flex flex-col justify-between h-36 group transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/20 rounded-full blur-2xl group-hover:bg-secondary/30 transition-all"></div>
          <div className="flex items-center space-x-2 text-secondary">
            <Layers className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]" />
            <span className="font-label text-xs uppercase tracking-wider font-bold">Reported</span>
          </div>
          <div className="font-headline font-black text-4xl mt-2 text-on-surface">
            {totalIssuesCount}
          </div>
        </div>

        {/* Stat 2: Resolved */}
        <div className="neon-card rounded-2xl p-5 border border-tertiary/40 flex flex-col justify-between h-36 group hover:border-tertiary/70 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-tertiary/15 rounded-full blur-2xl group-hover:bg-tertiary/25 transition-all"></div>
          <div className="flex items-center space-x-2 text-tertiary">
            <CheckCircle2 className="w-5 h-5 text-tertiary drop-shadow-[0_0_8px_rgba(255,224,74,0.8)]" />
            <span className="font-label text-xs uppercase tracking-wider font-bold">Resolved</span>
          </div>
          <div className="font-headline font-black text-4xl mt-2 text-on-surface">
            {resolvedCount}
          </div>
        </div>

        {/* Stat 3: Grid Status (Spans 2 columns) */}
        <div className="col-span-2 neon-card-primary rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div>
            <h3 className="font-label text-xs uppercase tracking-wider text-primary mb-1 font-bold">City Grid Status</h3>
            <p className="font-headline font-bold text-xl text-on-surface">Stable • {inProgressCount} Active Fixes</p>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-primary/50 bg-primary/10 flex items-center justify-center neon-text-primary shadow-[0_0_15px_rgba(255,45,120,0.5)]">
            <Zap className="w-7 h-7 text-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* 3. Main Action CTA Button - Hot Pink Neon Pill */}
      <section>
        <button
          onClick={() => navigateTo(isAuthenticated ? 'report' : 'login')}
          className="w-full bg-gradient-to-r from-[#ff2d78] via-[#e0005a] to-[#ff2d78] text-white rounded-full py-4.5 px-8 flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(255,45,120,0.6)] hover:shadow-[0_0_45px_rgba(255,45,120,0.9)] hover:scale-[1.01] active:scale-95 transition-all duration-300 font-headline font-black text-lg tracking-wide group"
        >
          <FilePlus className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
          <span>Report an Issue Now</span>
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* 4. Happening Nearby Horizontal Snap-Scroll Stream */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-xl text-on-surface flex items-center">
            <Radio className="w-5 h-5 text-secondary mr-2 drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]" />
            <span>Happening Nearby</span>
          </h3>
          <button
            onClick={() => navigateTo('map')}
            className="text-secondary font-label text-xs uppercase tracking-wider hover:neon-text-secondary transition-all font-bold"
          >
            View Map
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar">
          {issues.slice(0, 6).map((issue) => {
            const hasPhoto = issue.attachments && issue.attachments.length > 0;
            return (
              <div
                key={issue.id}
                onClick={() => navigateTo('activity')}
                className="min-w-[280px] max-w-[300px] snap-center neon-card rounded-2xl border border-white/10 hover:border-secondary/60 p-4 flex flex-col justify-between gap-3 group transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,255,204,0.2)]"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-label text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider font-bold shadow-sm ${
                      issue.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      issue.status === 'IN_PROGRESS' ? 'bg-tertiary/20 text-tertiary border border-tertiary/40' : 'bg-secondary/20 text-secondary border border-secondary/40'
                    }`}>
                      {issue.status}
                    </span>
                    <span className="text-on-surface-variant text-[11px] font-mono">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {hasPhoto && (
                    <div className="w-full h-32 rounded-xl bg-surface-dim overflow-hidden relative border border-white/10 mb-2">
                      <img
                        src={getAttachmentUrl(issue.attachments[0].file_path)}
                        alt={issue.title}
                        className="object-cover w-full h-full opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <h4 className="font-headline font-bold text-sm mb-1 text-on-surface group-hover:text-secondary transition-colors truncate">{issue.title}</h4>
                  <p className="font-body text-xs text-on-surface-variant line-clamp-2">{issue.description}</p>
                </div>

                <div className="flex items-center text-xs text-on-surface-variant font-body pt-2 border-t border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-secondary mr-1 shrink-0" />
                  <span className="truncate">{issue.location.address || `${issue.location.latitude.toFixed(3)}, ${issue.location.longitude.toFixed(3)}`}</span>
                </div>
              </div>
            );
          })}

          <div
            onClick={() => navigateTo('map')}
            className="min-w-[200px] snap-center neon-card rounded-2xl border border-white/10 hover:border-secondary/60 p-4 flex flex-col items-center justify-center group transition-all duration-300 cursor-pointer shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center mb-2 group-hover:bg-secondary/20 group-hover:text-secondary transition-colors text-secondary">
              <ArrowRight className="w-6 h-6" />
            </div>
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors font-bold">View All on Map</span>
          </div>
        </div>
      </section>

      {/* 5. Clickable Category Quick-Filter Strip */}
      <section className="neon-card p-5 rounded-2xl border border-secondary/30 space-y-3 shadow-xl">
        <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Browse Issues By Category</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-secondary text-background shadow-[0_0_15px_#00ffcc]'
                : 'bg-surface-container-high text-on-surface-variant hover:text-white border border-outline/30'
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
                    ? 'bg-primary text-white shadow-[0_0_15px_#ff2d78] border border-primary/50'
                    : 'bg-surface-container-high hover:bg-primary/20 text-on-surface border border-outline/30'
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
      <section className="neon-card-primary p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
              <Sparkles className="w-5 h-5 text-primary neon-text-primary" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">New to CivicFix?</h3>
              <p className="font-body text-xs text-on-surface-variant">Report your first municipal issue in under a minute with real-time audit updates.</p>
            </div>
          </div>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex items-center space-x-1 font-label text-xs font-bold text-secondary hover:text-primary px-3 py-1.5 rounded-xl hover:bg-secondary/10 transition-colors uppercase tracking-wider"
          >
            <span>{showHowItWorks ? 'Hide Guide' : 'How It Works'}</span>
            {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHowItWorks && (
          <div className="mt-4 pt-4 border-t border-primary/30 grid grid-cols-1 sm:grid-cols-3 gap-4 font-body text-xs text-on-surface animate-in fade-in duration-200">
            <div className="bg-surface-container p-4 rounded-xl border border-outline/20">
              <span className="font-headline font-bold text-primary block mb-1">Step 1: Capture Evidence</span>
              <p className="text-on-surface-variant text-xs leading-relaxed">Take a photo with your phone, pick an issue category, and your GPS coordinates will auto-fill.</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline/20">
              <span className="font-headline font-bold text-tertiary block mb-1">Step 2: Official Triage</span>
              <p className="text-on-surface-variant text-xs leading-relaxed">Municipal officials review your report, acknowledge it, and dispatch a specialized maintenance crew.</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline/20">
              <span className="font-headline font-bold text-secondary block mb-1">Step 3: Verification & Fix</span>
              <p className="text-on-surface-variant text-xs leading-relaxed">Crews complete work on-site, status updates to RESOLVED, and audit logs are recorded permanently.</p>
            </div>
          </div>
        )}
      </section>

      {/* 7. Search & Filter Controls */}
      <section className="neon-card p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search reported issues by title, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-dim border border-outline/30 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-secondary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-on-surface-variant hover:text-white"
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
                ? 'bg-primary text-white shadow-[0_0_15px_#ff2d78]'
                : 'bg-surface-container-high text-on-surface-variant hover:text-white border border-outline/30'
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
          <h2 className="font-headline font-bold text-lg text-on-surface flex items-center space-x-2">
            <span>Reported Civic Issues</span>
            <span className="font-label text-xs bg-secondary/20 text-secondary px-2.5 py-0.5 rounded-full font-bold border border-secondary/40 shadow-[0_0_8px_rgba(0,255,204,0.4)]">
              {filteredIssues.length} Reports
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="neon-card rounded-2xl p-6 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="neon-card-secondary rounded-3xl p-12 text-center text-on-surface-variant space-y-4 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-secondary/20 border border-secondary/40 flex items-center justify-center mx-auto text-secondary shadow-[0_0_15px_rgba(0,255,204,0.4)]">
              <ShieldCheck className="w-8 h-8 text-secondary neon-text-secondary" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">No Issues Matching Filters</h3>
              <p className="font-body text-xs text-on-surface-variant mt-1">There are no reported civic hazards matching your current search or status filters.</p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedCategory('');
                  setSearchQuery('');
                  setHighPriorityOnly(false);
                }}
                className="font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-surface-container-high hover:bg-slate-800 text-on-surface font-bold transition-all"
              >
                Reset Filters
              </button>
              <button
                onClick={() => navigateTo(isAuthenticated ? 'report' : 'login')}
                className="font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-primary text-white font-bold transition-all shadow-[0_0_15px_#ff2d78] neon-btn-glow"
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
