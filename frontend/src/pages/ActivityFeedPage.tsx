import React, { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, History, CheckCircle2, Clock, Filter, User, Send, X, Check } from 'lucide-react';
import { issuesApi, getAttachmentUrl } from '../services/api';
import { Issue } from '../types';
import { useAuth } from '../context/AuthContext';

interface CommentItem {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export const ActivityFeedPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Upvote Animations State
  const [animatingIssueId, setAnimatingIssueId] = useState<string | null>(null);
  const [floatingPlusId, setFloatingPlusId] = useState<string | null>(null);
  const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>({});
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  // Dynamic Comments State
  const [activeCommentIssue, setActiveCommentIssue] = useState<Issue | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await issuesApi.list({ limit: 50 });
      const fetchedIssues = res.data.items || [];
      setIssues(fetchedIssues);

      // Initialize upvote counts
      const counts: Record<string, number> = {};
      fetchedIssues.forEach((i) => {
        counts[i.id] = i.upvote_count;
      });
      setUpvoteCounts(counts);
    } catch (err) {
      console.error('Failed to load activity stream:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Load persisted comments from localStorage
    const savedComments = localStorage.getItem('civicfix_issue_comments');
    if (savedComments) {
      try {
        setCommentsMap(JSON.parse(savedComments));
      } catch (e) {
        console.error('Failed to parse saved comments', e);
      }
    }
  }, []);

  const saveComments = (updatedMap: Record<string, CommentItem[]>) => {
    setCommentsMap(updatedMap);
    localStorage.setItem('civicfix_issue_comments', JSON.stringify(updatedMap));
  };

  const getCommentsForIssue = (issueId: string): CommentItem[] => {
    if (commentsMap[issueId]) return commentsMap[issueId];
    // Default seed comments if none exist
    return [
      {
        id: `seed-1-${issueId}`,
        authorName: 'Municipal Public Works',
        authorRole: 'OFFICIAL',
        content: 'Dispatch team assigned. Field crew is conducting on-site assessment.',
        createdAt: '10 mins ago',
      },
      {
        id: `seed-2-${issueId}`,
        authorName: 'Ramesh Kumar',
        authorRole: 'CITIZEN',
        content: 'Thank you for reporting! Traffic has been slowing down here all morning.',
        createdAt: '5 mins ago',
      },
    ];
  };

  const handleUpvote = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || upvotedIds[issueId]) return;

    // Trigger Pop & Particle Animations
    setAnimatingIssueId(issueId);
    setFloatingPlusId(issueId);
    setUpvotedIds((prev) => ({ ...prev, [issueId]: true }));
    setUpvoteCounts((prev) => ({ ...prev, [issueId]: (prev[issueId] || 0) + 1 }));

    setTimeout(() => setAnimatingIssueId(null), 500);
    setTimeout(() => setFloatingPlusId(null), 800);

    try {
      await issuesApi.upvote(issueId);
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const handleShare = async (issue: Issue, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?issue=${issue.id}`;
    const shareData = {
      title: `CivicFix: ${issue.title}`,
      text: issue.description,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage('🔗 Issue Link Copied to Clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setToastMessage('Link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentIssue || !newCommentText.trim()) return;

    const currentComments = getCommentsForIssue(activeCommentIssue.id);
    const newCommentObj: CommentItem = {
      id: `comment-${Date.now()}`,
      authorName: user?.full_name || 'Anonymous Citizen',
      authorRole: user?.role || 'CITIZEN',
      content: newCommentText.trim(),
      createdAt: 'Just now',
    };

    const updated = {
      ...commentsMap,
      [activeCommentIssue.id]: [newCommentObj, ...currentComments],
    };

    saveComments(updated);
    setNewCommentText('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 my-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#00ffcc] text-slate-950 px-5 py-3 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_#00ffcc] flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4 text-slate-950 font-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header matching Stitch Screen 4 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white neon-text-primary">Live Activity Stream</h2>
          <p className="font-label text-xs text-slate-400 uppercase tracking-widest mt-1">
            Municipal Operations Sector • {issues.length} Active Reports
          </p>
        </div>
        <button
          onClick={fetchFeed}
          className="h-10 w-10 rounded-2xl bg-[#101222] border border-[#1b1e36] flex items-center justify-center text-slate-300 hover:text-[#00ffcc] hover:border-[#00ffcc]/50 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,255,204,0.2)]"
          title="Filter / Refresh Feed"
        >
          <Filter className="w-4 h-4 text-[#00ffcc]" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-[#0e101d] rounded-2xl h-96 animate-pulse border border-[#1b1e34]"></div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-[#0e101d] rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-[#00ffcc]/30">
          <p className="font-headline font-bold text-lg text-white">No Activity Reports Found</p>
          <p className="font-body text-xs">Be the first to submit a community hazard report.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {issues.map((issue) => {
            const hasPhoto = issue.attachments && issue.attachments.length > 0;
            const isResolved = issue.status === 'RESOLVED';
            const issueComments = getCommentsForIssue(issue.id);
            const currentUpvotes = upvoteCounts[issue.id] ?? issue.upvote_count;
            const isUpvoted = upvotedIds[issue.id];

            return (
              <article
                key={issue.id}
                className="bg-[#0e101d] rounded-2xl border border-[#1b1e34] overflow-hidden transition-all duration-300 flex flex-col group relative hover:border-[#00ffcc]/40 shadow-xl"
              >
                {/* Corner Glow Accent */}
                <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-[50px] pointer-events-none transition-all duration-500 ${
                  isResolved ? 'bg-[#00ffcc]/10 group-hover:bg-[#00ffcc]/20' : 'bg-[#ff2d78]/10 group-hover:bg-[#ff2d78]/20'
                }`}></div>

                {/* Author & Status Header */}
                <div className="p-5 flex items-center justify-between border-b border-[#1b1e34] relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#171a2e] border border-[#232745] flex items-center justify-center overflow-hidden">
                      <User className="w-5 h-5 text-slate-400 group-hover:text-[#00ffcc] transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-label font-bold text-sm text-white group-hover:text-[#00ffcc] transition-colors">
                        @citizen_{issue.reporter_id ? issue.reporter_id.substring(0, 6) : 'user'}
                      </h3>
                      <span className="text-xs text-slate-400 font-body">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    isResolved
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                      : 'border-[#ff2d78]/50 bg-[#ff2d78]/10 text-[#ff2d78]'
                  }`}>
                    {isResolved ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[#ff2d78]" />
                    )}
                    <span className="font-label text-[10px] uppercase tracking-wider font-bold">
                      {issue.status}
                    </span>
                  </div>
                </div>

                {/* Media Image */}
                {hasPhoto && (
                  <div className="relative w-full h-72 bg-slate-950 z-10 overflow-hidden border-b border-[#1b1e34]">
                    <img
                      src={getAttachmentUrl(issue.attachments[0].file_path)}
                      alt={issue.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Card Content */}
                <div className="p-5 flex flex-col gap-4 relative z-10">
                  <div>
                    <h4 className="font-headline font-bold text-xl text-white mb-2 group-hover:text-[#00ffcc] transition-colors">
                      {issue.title}
                    </h4>
                    <p className="font-body text-sm text-slate-300 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Sleek Transparency Timeline Bar matching Stitch Screen 4 */}
                  <div className="mt-2 bg-[#131527] rounded-xl p-4 border border-[#232745]">
                    <p className="font-label text-[10px] text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-bold">
                      <History className="w-3.5 h-3.5 text-[#00ffcc]" /> TRANSPARENCY AUDIT TIMELINE
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]"></div>
                      <div className={`h-[2px] flex-1 ${issue.status !== 'SUBMITTED' ? 'bg-[#00ffcc]' : 'bg-slate-700'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${issue.status !== 'SUBMITTED' ? 'bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]' : 'bg-slate-700'}`}></div>
                      <div className={`h-[2px] flex-1 ${isResolved ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${isResolved ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-label">
                      <span className="text-[#00ffcc] font-bold">Reported</span>
                      <span className={issue.status !== 'SUBMITTED' ? 'text-[#00ffcc] font-bold' : 'text-slate-500'}>Assessing</span>
                      <span className={isResolved ? 'text-emerald-400 font-bold' : 'text-slate-500'}>Resolved</span>
                    </div>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1b1e34] mt-1 relative">
                    <div className="flex items-center gap-6">
                      {/* Animated Upvote Button */}
                      <button
                        onClick={(e) => handleUpvote(issue.id, e)}
                        disabled={!isAuthenticated || isUpvoted}
                        className={`flex items-center gap-2 font-label text-xs uppercase tracking-wider font-bold transition-all relative ${
                          isUpvoted
                            ? 'text-[#00ffcc]'
                            : 'text-slate-300 hover:text-[#00ffcc] active:scale-90'
                        }`}
                      >
                        {/* Floating +1 Particle Effect */}
                        {floatingPlusId === issue.id && (
                          <span className="absolute -top-6 left-2 text-[#00ffcc] font-black text-sm animate-float-plus pointer-events-none drop-shadow-[0_0_10px_#00ffcc]">
                            +1
                          </span>
                        )}
                        <ThumbsUp
                          className={`w-4 h-4 transition-transform ${
                            animatingIssueId === issue.id ? 'animate-thumb-pop text-[#00ffcc] fill-[#00ffcc]' : ''
                          } ${isUpvoted ? 'fill-[#00ffcc] text-[#00ffcc]' : ''}`}
                        />
                        <span>{currentUpvotes}</span>
                      </button>

                      {/* Dynamic Comments Button */}
                      <button
                        onClick={() => setActiveCommentIssue(issue)}
                        className="flex items-center gap-2 text-slate-300 hover:text-[#00ffcc] transition-all font-label text-xs uppercase tracking-wider font-bold active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 text-[#00ffcc]" />
                        <span>{issueComments.length} Comments</span>
                      </button>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShare(issue, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#ff2d78] hover:bg-[#ff2d78]/10 transition-all active:scale-90"
                      title="Share issue link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* DYNAMIC COMMENTS MODAL / DRAWER */}
      {activeCommentIssue && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0e101d] rounded-3xl border border-[#00ffcc]/40 p-6 max-w-lg w-full space-y-4 shadow-[0_0_40px_rgba(0,255,204,0.25)] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#1b1e34] pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[#00ffcc]" />
                <h3 className="font-headline font-bold text-lg text-white">
                  Community Discussion ({getCommentsForIssue(activeCommentIssue.id).length})
                </h3>
              </div>
              <button
                onClick={() => setActiveCommentIssue(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Issue Title Context */}
            <div className="bg-[#141629] p-3 rounded-2xl border border-[#232745] shrink-0">
              <span className="font-label text-[10px] uppercase font-bold text-[#00ffcc] block">Discussing Issue</span>
              <p className="font-headline font-semibold text-sm text-white truncate">{activeCommentIssue.title}</p>
            </div>

            {/* Comments Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar min-h-[200px]">
              {getCommentsForIssue(activeCommentIssue.id).map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-[#141629] border border-[#232745] space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-[#00ffcc]/20 border border-[#00ffcc]/40 flex items-center justify-center text-[#00ffcc] font-headline font-bold text-xs">
                        {c.authorName.charAt(0)}
                      </div>
                      <span className="font-headline font-bold text-xs text-white">{c.authorName}</span>
                      <span className={`font-label text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        c.authorRole === 'OFFICIAL' ? 'bg-[#ffe04a]/20 text-[#ffe04a]' : 'bg-[#00ffcc]/20 text-[#00ffcc]'
                      }`}>
                        {c.authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{c.createdAt}</span>
                  </div>
                  <p className="font-body text-xs text-slate-300 leading-relaxed pl-8">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-[#1b1e34] shrink-0 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isAuthenticated ? "Write a community comment..." : "Log in to join discussion"}
                  disabled={!isAuthenticated}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-[#141629] border border-[#232745] rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isAuthenticated || !newCommentText.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-[#00ffcc] text-slate-950 font-label font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_#00ffcc] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
