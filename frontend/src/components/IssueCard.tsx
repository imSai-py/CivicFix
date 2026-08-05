import React, { useState } from 'react';
import { MapPin, ThumbsUp, Eye, X, Image as ImageIcon, Calendar } from 'lucide-react';
import { Issue } from '../types';
import { StatusBadge } from './StatusBadge';
import { issuesApi, getAttachmentUrl } from '../services/api';

interface IssueCardProps {
  issue: Issue;
  isAuthenticated: boolean;
  onRefresh?: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  isAuthenticated,
  onRefresh,
}) => {
  const [upvotes, setUpvotes] = useState(issue.upvote_count);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);

  // Lightbox Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || isUpvoted || isUpvoting) return;

    setIsUpvoting(true);
    try {
      const res = await issuesApi.upvote(issue.id);
      setUpvotes(res.data.upvote_count);
      setIsUpvoted(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to upvote:', err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const openLightbox = (url: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage({ url, fileName });
  };

  return (
    <>
      <div className="bg-surface-container rounded-2xl p-5 border border-outline/20 hover:border-secondary/50 transition-all duration-300 flex flex-col justify-between space-y-4 group hover:shadow-[0_0_20px_rgba(0,255,204,0.15)] relative overflow-hidden">
        {/* Header & Badges */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <StatusBadge status={issue.status} />
              <StatusBadge priority={issue.priority} />
            </div>
            <span className="font-label text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-secondary" />
              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
            {issue.title}
          </h3>

          <p className="font-body text-xs text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
            {issue.description}
          </p>

          {/* Inline Photo Preview thumbnails */}
          {issue.attachments && issue.attachments.length > 0 && (
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-label text-on-surface-variant">
                <span className="flex items-center gap-1 font-semibold text-secondary">
                  <ImageIcon className="w-3 h-3 text-secondary" /> Photo Evidence ({issue.attachments.length})
                </span>
                <span className="text-[10px] text-on-surface-variant">Click Eye to preview full size</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {issue.attachments.map((att) => {
                  const mediaUrl = getAttachmentUrl(att.file_path);
                  return (
                    <div
                      key={att.id}
                      className="relative group/thumb rounded-xl overflow-hidden border border-outline/30 bg-surface-dim shrink-0 w-24 h-20"
                    >
                      <img
                        src={mediaUrl}
                        alt={att.file_name}
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={(e) => openLightbox(mediaUrl, att.file_name, e)}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center space-x-1 text-secondary font-label text-[10px] font-bold uppercase transition-opacity"
                        title="Preview image in lightbox"
                      >
                        <Eye className="w-4 h-4 text-secondary neon-text-secondary" />
                        <span>Preview</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Location & Upvote Action Footer */}
        <div className="pt-3 border-t border-outline/20 flex items-center justify-between text-xs">
          <div className="flex items-center text-on-surface-variant truncate mr-2">
            <MapPin className="w-3.5 h-3.5 text-secondary mr-1 shrink-0" />
            <span className="truncate font-body text-[11px]">
              {issue.location.address || `${issue.location.latitude.toFixed(4)}, ${issue.location.longitude.toFixed(4)}`}
            </span>
          </div>

          <button
            onClick={handleUpvote}
            disabled={!isAuthenticated || isUpvoted || isUpvoting}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-label text-xs uppercase tracking-wider font-bold transition-all shrink-0 ${
              isUpvoted
                ? 'bg-secondary/20 text-secondary border border-secondary/50 shadow-[0_0_10px_#00ffcc]'
                : isAuthenticated
                ? 'bg-surface-container-high hover:bg-secondary/20 hover:text-secondary text-on-surface border border-outline/30'
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-50'
            }`}
            title={isAuthenticated ? 'Upvote this issue' : 'Log in to upvote'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-secondary text-secondary' : ''}`} />
            <span>{upvotes}</span>
          </button>
        </div>
      </div>

      {/* Lightbox Image Preview Modal matching Stitch UI */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewImage(null);
          }}
        >
          <div
            className="relative max-w-4xl w-full bg-surface-container rounded-3xl border border-secondary/40 p-5 shadow-[0_0_30px_rgba(0,255,204,0.2)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline/30 pb-3">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-secondary neon-text-secondary" />
                <span className="font-headline font-bold text-sm text-on-surface">{previewImage.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-surface-dim rounded-2xl p-2 max-h-[70vh] overflow-hidden border border-outline/20">
              <img
                src={previewImage.url}
                alt={previewImage.fileName}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
