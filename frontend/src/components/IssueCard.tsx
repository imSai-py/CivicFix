import React, { useState } from 'react';
import { ThumbsUp, MapPin, Calendar, Image as ImageIcon, History, Upload } from 'lucide-react';
import { AuditLog, Issue } from '../types';
import { StatusBadge } from './StatusBadge';
import { issuesApi } from '../services/api';

interface IssueCardProps {
  issue: Issue;
  onUpvoteSuccess?: () => void;
  onRefresh?: () => void;
  isAuthenticated: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onUpvoteSuccess,
  onRefresh,
  isAuthenticated,
}) => {
  const [upvotes, setUpvotes] = useState(issue.upvote_count);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      alert('Please log in to upvote issues.');
      return;
    }
    try {
      const res = await issuesApi.upvote(issue.id);
      setUpvotes(res.data.upvote_count);
      setHasUpvoted(true);
      if (onUpvoteSuccess) onUpvoteSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Upvote failed.');
    }
  };

  const toggleAuditLogs = async () => {
    if (!showAuditLogs && auditLogs.length === 0) {
      setIsLoadingLogs(true);
      try {
        const res = await issuesApi.getAuditLogs(issue.id);
        setAuditLogs(res.data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoadingLogs(false);
      }
    }
    setShowAuditLogs(!showAuditLogs);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await issuesApi.uploadAttachment(issue.id, file);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const formattedDate = new Date(issue.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <StatusBadge status={issue.status} />
            <StatusBadge priority={issue.priority} />
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
          {issue.title}
        </h3>
        <p className="text-slate-300 text-sm line-clamp-3 mb-4 leading-relaxed">
          {issue.description}
        </p>

        {/* Location Info */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-4 bg-slate-900/40 px-3 py-2 rounded-xl border border-slate-800/80">
          <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="truncate">
            {issue.location.address || `${issue.location.latitude.toFixed(4)}, ${issue.location.longitude.toFixed(4)}`}
          </span>
        </div>

        {/* Attachments Section */}
        {issue.attachments && issue.attachments.length > 0 && (
          <div className="mb-4">
            <span className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> Photos ({issue.attachments.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {issue.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors truncate max-w-[200px]"
                >
                  📸 {att.file_name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {/* Upvote Button */}
        <button
          onClick={handleUpvote}
          disabled={hasUpvoted}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            hasUpvoted
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
          <span>{upvotes} Upvotes</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Upload Attachment Button */}
          {isAuthenticated && (
            <label className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-600/10 transition-colors" title="Attach Photo">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          )}

          {/* Audit Logs Button */}
          <button
            onClick={toggleAuditLogs}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* Timeline Audit Logs Drawer */}
      {showAuditLogs && (
        <div className="mt-4 pt-4 border-t border-slate-800 text-xs bg-slate-950/60 p-3 rounded-xl">
          <span className="font-semibold text-slate-300 mb-2 block">Audit History Timeline</span>
          {isLoadingLogs ? (
            <div className="text-slate-500 py-2 text-center">Loading audit log...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-slate-500 py-2 text-center">No log records found.</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex flex-col border-l-2 border-indigo-500/40 pl-2.5 py-0.5">
                  <div className="flex justify-between font-medium text-slate-300">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  {log.remarks && <p className="text-slate-400 text-[11px] italic mt-0.5">{log.remarks}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
