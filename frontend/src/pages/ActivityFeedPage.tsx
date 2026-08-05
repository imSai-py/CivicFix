import React, { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, History, CheckCircle2, Clock, Filter, User } from 'lucide-react';
import { issuesApi, getAttachmentUrl } from '../services/api';
import { Issue } from '../types';
import { useAuth } from '../context/AuthContext';

export const ActivityFeedPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await issuesApi.list({ limit: 50 });
      setIssues(res.data.items || []);
    } catch (err) {
      console.error('Failed to load activity stream:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleUpvote = async (issueId: string) => {
    if (!isAuthenticated) return;
    try {
      await issuesApi.upvote(issueId);
      fetchFeed();
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 my-4">
      {/* Header matching Stitch Screen 4 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface neon-text-primary">Live Activity Stream</h2>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            Municipal Operations Sector • {issues.length} Active Reports
          </p>
        </div>
        <button
          onClick={fetchFeed}
          className="h-9 w-9 rounded-full bg-surface-container border border-outline/50 flex items-center justify-center text-on-surface hover:text-secondary hover:border-secondary transition-colors active:scale-95 shadow-[0_0_8px_rgba(0,255,204,0.2)]"
          title="Filter / Refresh Feed"
        >
          <Filter className="w-4 h-4 text-secondary" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-surface-container rounded-xl h-96 animate-pulse border border-outline/20"></div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-surface-container rounded-2xl p-12 text-center text-on-surface-variant space-y-2 border border-secondary/30">
          <p className="font-headline font-bold text-lg text-on-surface">No Activity Reports Found</p>
          <p className="font-body text-xs">Be the first to submit a community hazard report.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {issues.map((issue) => {
            const hasPhoto = issue.attachments && issue.attachments.length > 0;
            const isResolved = issue.status === 'RESOLVED';

            return (
              <article
                key={issue.id}
                className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden transition-all duration-300 flex flex-col group relative hover:border-primary/50"
              >
                {/* Corner Glow Accent matching Stitch Screen 4 */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] pointer-events-none transition-all duration-500 ${
                  isResolved ? 'bg-secondary/10 group-hover:bg-secondary/20' : 'bg-tertiary/10 group-hover:bg-tertiary/20'
                }`}></div>

                {/* Author & Status Header */}
                <div className="p-5 flex items-center justify-between border-b border-outline-variant/20 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline/50 flex items-center justify-center overflow-hidden">
                      <User className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-label font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        @citizen_{issue.reporter_id ? issue.reporter_id.substring(0, 6) : 'user'}
                      </h3>
                      <span className="text-xs text-on-surface-variant font-body">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    isResolved
                      ? 'border-secondary/50 bg-secondary/10 text-secondary'
                      : 'border-tertiary/50 bg-tertiary/10 text-tertiary'
                  }`}>
                    {isResolved ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-tertiary" />
                    )}
                    <span className="font-label text-[10px] uppercase tracking-wider font-bold">
                      {issue.status}
                    </span>
                  </div>
                </div>

                {/* Media Image */}
                {hasPhoto && (
                  <div className="relative w-full h-64 bg-surface-dim z-10 overflow-hidden">
                    <img
                      src={getAttachmentUrl(issue.attachments[0].file_path)}
                      alt={issue.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Card Content */}
                <div className="p-5 flex flex-col gap-4 relative z-10">
                  <div>
                    <h4 className="font-headline font-bold text-lg text-on-surface mb-2 group-hover:text-white">
                      {issue.title}
                    </h4>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Transparency Timeline Bar matching Stitch Screen 4 */}
                  <div className="mt-2 bg-surface-container-highest/50 rounded-lg p-3 border border-outline-variant/50">
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1 font-bold">
                      <History className="w-3.5 h-3.5 text-secondary" /> Transparency Audit Timeline
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(0,255,204,0.6)]"></div>
                      <div className={`h-[1px] flex-1 ${issue.status !== 'SUBMITTED' ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${issue.status !== 'SUBMITTED' ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
                      <div className={`h-[1px] flex-1 ${isResolved ? 'bg-secondary' : 'bg-outline-variant/30'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${isResolved ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-on-surface-variant font-label">
                      <span className="text-secondary font-bold">Reported</span>
                      <span className={issue.status !== 'SUBMITTED' ? 'text-secondary font-bold' : ''}>Assessing</span>
                      <span className={isResolved ? 'text-secondary font-bold' : ''}>Resolved</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-1">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => handleUpvote(issue.id)}
                        className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-all active:scale-90"
                      >
                        <ThumbsUp className="w-4 h-4 text-primary" />
                        <span className="font-label text-xs font-bold neon-text-primary">{issue.upvote_count}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-secondary transition-all active:scale-90">
                        <MessageSquare className="w-4 h-4 text-secondary" />
                        <span className="font-label text-xs font-bold">Comments</span>
                      </button>
                    </div>
                    <button className="text-on-surface-variant hover:text-primary transition-all active:scale-90">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
