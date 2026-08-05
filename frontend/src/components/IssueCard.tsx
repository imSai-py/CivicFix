import React, { useState } from 'react';
import { MapPin, ThumbsUp, Eye, X, Image as ImageIcon, Calendar, Star, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Issue } from '../types';
import { StatusBadge } from './StatusBadge';
import { issuesApi, getAttachmentUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(issue.upvote_count);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);

  // Rating & Reopen Modal States
  const [userRating, setUserRating] = useState<number>(issue.citizen_rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clickedStar, setClickedStar] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>(issue.citizen_feedback || '');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  // Lightbox Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);

  const isReporter = user && user.id === issue.reporter_id;
  const isResolved = issue.status === 'RESOLVED';
  const beforePhoto = issue.attachments && issue.attachments.length > 0 ? getAttachmentUrl(issue.attachments[0].file_path) : null;
  const afterPhoto = issue.resolution_photo_url ? getAttachmentUrl(issue.resolution_photo_url) : null;

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

  const handleRateSubmit = async () => {
    if (!userRating) return;
    setIsSubmittingRating(true);
    try {
      await issuesApi.rate(issue.id, userRating, feedbackText);
      setShowRatingModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!reopenReason.trim()) return;
    setIsReopening(true);
    try {
      await issuesApi.reopen(issue.id, reopenReason);
      setShowReopenModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to re-open issue:', err);
    } finally {
      setIsReopening(false);
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

          {/* BEFORE / AFTER PHOTO AUDIT COMPARISON (for Resolved Issues) */}
          {isResolved && (beforePhoto || afterPhoto) && (
            <div className="mt-4 p-3.5 rounded-xl bg-surface-container-high/80 border border-secondary/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-label font-bold text-secondary">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Resolution Audit Proof
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Side-by-Side</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Before Photo */}
                <div className="relative rounded-lg overflow-hidden border border-white/10 bg-surface-dim h-24">
                  {beforePhoto ? (
                    <img src={beforePhoto} alt="Before Fix" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-on-surface-variant">No Photo</div>
                  )}
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 font-label text-[9px] uppercase font-bold text-amber-400">
                    Before
                  </div>
                </div>

                {/* After Photo */}
                <div className="relative rounded-lg overflow-hidden border border-secondary/40 bg-surface-dim h-24">
                  {afterPhoto ? (
                    <img src={afterPhoto} alt="After Fix" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-emerald-400 font-bold">Verified Repair</div>
                  )}
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 font-label text-[9px] uppercase font-bold text-emerald-300">
                    After (Fixed)
                  </div>
                </div>
              </div>

              {issue.resolution_notes && (
                <p className="font-body text-[11px] text-on-surface-variant italic pt-1 border-t border-white/5">
                  <span className="text-secondary font-semibold not-italic">Crew Notes:</span> {issue.resolution_notes}
                </p>
              )}
            </div>
          )}

          {/* Standard Media Photo Thumbnails if not resolved */}
          {!isResolved && issue.attachments && issue.attachments.length > 0 && (
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

          {/* CITIZEN RATING & RE-OPEN CONTROLS (for Resolved Issues) */}
          {isResolved && isReporter && (
            <div className="mt-4 pt-3 border-t border-secondary/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (issue.citizen_rating || userRating) >= star;
                  return (
                    <Star
                      key={star}
                      fill={isFilled ? "#ffe04a" : "none"}
                      color={isFilled ? "#ffe04a" : "#475569"}
                      onClick={() => {
                        setUserRating(star);
                        setShowRatingModal(true);
                      }}
                      className={`w-4 h-4 cursor-pointer transition-all ${
                        isFilled
                          ? 'drop-shadow-[0_0_8px_rgba(255,224,74,0.9)] scale-110'
                          : 'hover:scale-125'
                      }`}
                    />
                  );
                })}
                <span className="font-label text-[11px] font-bold text-tertiary ml-1">
                  {issue.citizen_rating ? `${issue.citizen_rating}★ Rated` : 'Rate Fix'}
                </span>
              </div>

              <button
                onClick={() => setShowReopenModal(true)}
                className="font-label text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-open Fix
              </button>
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

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-3xl border border-tertiary/50 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline/20 pb-3">
              <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                <Star fill="#ffe04a" color="#ffe04a" className="w-5 h-5 animate-pulse" /> Rate Repair Quality
              </h3>
              <button onClick={() => setShowRatingModal(false)} className="text-on-surface-variant hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dynamic Animated Star Selector */}
              <div className="flex justify-center items-center space-x-2 py-3 bg-[#0c0c18] rounded-2xl border border-tertiary/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeRating = hoverRating || userRating;
                  const isFilled = activeRating >= star;
                  const isPopAnim = clickedStar === star;

                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setUserRating(star);
                        setClickedStar(star);
                        setTimeout(() => setClickedStar(null), 450);
                      }}
                      className={`p-1.5 focus:outline-none transition-transform duration-200 transform ${
                        isPopAnim ? 'animate-star-pop' : isFilled ? 'scale-110' : 'hover:scale-125'
                      }`}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        fill={isFilled ? "#ffe04a" : "none"}
                        color={isFilled ? "#ffe04a" : "#475569"}
                        className={`w-9 h-9 transition-all duration-300 ${
                          isFilled
                            ? 'drop-shadow-[0_0_16px_rgba(255,224,74,1)]'
                            : 'hover:color-[#ffe04a]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Rating Label */}
              <p className="text-center font-headline font-bold text-xs uppercase tracking-widest text-tertiary h-5 transition-all">
                {(hoverRating || userRating) === 1 && '⭐ 1 Star — Incomplete Fix'}
                {(hoverRating || userRating) === 2 && '⭐⭐ 2 Stars — Fair Work'}
                {(hoverRating || userRating) === 3 && '⭐⭐⭐ 3 Stars — Good Repair'}
                {(hoverRating || userRating) === 4 && '⭐⭐⭐⭐ 4 Stars — Very Satisfied!'}
                {(hoverRating || userRating) === 5 && '⭐⭐⭐⭐⭐ 5 Stars — Outstanding Quality!'}
                {!(hoverRating || userRating) && 'Hover and click stars to select rating'}
              </p>

              {/* Dynamic Animated Feedback Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-label font-bold">
                  <span className="text-tertiary">Feedback Notes (Optional)</span>
                  <span className="text-on-surface-variant font-mono text-[10px]">
                    {feedbackText.length}/500
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    maxLength={500}
                    placeholder="Enter optional feedback notes for the municipal repair crew..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-[#0c0c18] border border-tertiary/40 focus:border-tertiary rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tertiary/40 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] focus:shadow-[0_0_20px_rgba(255,224,74,0.25)] transition-all duration-300 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <button
                onClick={handleRateSubmit}
                disabled={isSubmittingRating || !userRating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ffe04a] to-[#ffb700] text-slate-950 font-headline font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_25px_rgba(255,224,74,0.6)] hover:shadow-[0_0_35px_rgba(255,224,74,0.9)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRating ? 'Submitting Rating...' : 'Submit Citizen Rating (+50 XP Earned)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RE-OPEN MODAL */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-3xl border border-amber-500/50 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline/20 pb-3">
              <h3 className="font-headline font-bold text-lg text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" /> Re-Open Issue Report
              </h3>
              <button onClick={() => setShowReopenModal(false)} className="text-on-surface-variant hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="font-body text-xs text-on-surface-variant">
                If the municipal crew's repair is incomplete or ineffective, enter a reason to send this report back to active repair status.
              </p>

              <textarea
                placeholder="Describe why the repair is incomplete..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="w-full bg-surface-dim border border-outline/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-amber-500"
                rows={3}
              />

              <button
                onClick={handleReopenSubmit}
                disabled={isReopening || !reopenReason.trim()}
                className="w-full py-3 rounded-xl bg-amber-500 text-background font-headline font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)] disabled:opacity-50"
              >
                {isReopening ? 'Re-opening Issue...' : 'Confirm Re-Open Report'}
              </button>
            </div>
          </div>
        </div>
      )}

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
