import React, { useEffect, useState } from 'react';
import { Filter, Search, ShieldCheck, Activity, Tag, ListFilter } from 'lucide-react';
import { IssueCard } from '../components/IssueCard';
import { issuesApi, categoriesApi } from '../services/api';
import { Category, Issue } from '../types';
import { CustomDropdown, DropdownOption } from '../components/CustomDropdown';

interface FeedPageProps {
  isAuthenticated: boolean;
}

export const FeedPage: React.FC<FeedPageProps> = ({ isAuthenticated }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchFeedData = async () => {
    setIsLoading(true);
    try {
      const [issueRes, catRes] = await Promise.all([
        issuesApi.list({
          status: selectedStatus || undefined,
          category_id: selectedCategory || undefined,
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

  const filteredIssues = issues.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dropdown options
  const statusOptions: DropdownOption[] = [
    { value: '', label: 'All Statuses', icon: <ListFilter className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'SUBMITTED', label: 'Submitted', badgeColor: 'bg-indigo-500' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged', badgeColor: 'bg-blue-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', badgeColor: 'bg-amber-500' },
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-panel glow-indigo border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Community Infrastructure Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Transparent Civic Reporting <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
              For Better Cities.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Report infrastructure failures, potholes, streetlights, and public hazards directly to municipal department officials with real-time audit lifecycle tracking.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search reported issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

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

      {/* Feed Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Reported Civic Issues</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {filteredIssues.length}
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
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-semibold text-slate-300">No issues found.</p>
            <p className="text-xs mt-1">Try resetting your filter parameters or submit a new report.</p>
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
