import React, { useState } from 'react';
import { ThumbsUp, MapPin, Calendar, Image as ImageIcon, History, Upload, X, Download } from 'lucide-react';
import { AuditLog, Issue } from '../types';
import { StatusBadge } from './StatusBadge';
import { issuesApi, getAttachmentUrl } from '../services/api';

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

  // Lightbox Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);

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

  const openImagePreview = (e: React.MouseEvent, filePath: string, fileName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = getAttachmentUrl(filePath);
    setPreviewImage({ url: fullUrl, fileName });
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

        {/* Inline Photo Evidence Grid */}
        {issue.attachments && issue.attachments.length > 0 && (
          <div className="mb-4 space-y-2">
            <span className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-400" /> Photo Evidence ({issue.attachments.length})
            </span>

            <div className="grid grid-cols-2 gap-2">
              {issue.attachments.map((att) => {
                const imgUrl = getAttachmentUrl(att.file_path);
                return (
                  <button
                    key={att.id}
                    type="button"
                    onClick={(e) => openImagePreview(e, att.file_path, att.file_name)}
                    className="group/img relative rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500/60 aspect-video bg-slate-900 focus:outline-none transition-all shadow-sm"
                  >
                    <img
                      src={imgUrl}
                      alt={att.file_name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2 opacity-90 group-hover/img:opacity-100 transition-opacity">
                      <span className="text-[10px] font-semibold text-slate-200 truncate max-w-full">
                        📸 {att.file_name}
                      </span>
                    </div>
                  </button>
                );
              })}
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

      {/* Full-Screen Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-2xl space-y-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 truncate">
                <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-sm font-semibold text-white truncate">{previewImage.fileName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={previewImage.url}
                  download={previewImage.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Image</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo Viewer Container */}
            <div className="flex items-center justify-center bg-black/60 rounded-2xl p-2 max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.fileName}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
